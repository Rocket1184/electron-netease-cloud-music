'use strict';

// Just let it keep going with CommonJS .......
const { ipcMain } = require('electron');

const debug = require('debug');

const MPRISEmitter = require('./mpris');

const TAG = 'MPRIS:IPC';
const d = debug(TAG);
let msgId = 0;
const cbMap = new Map();
const getters = ['getPosition'];
const dbusEvents = ['raise', 'quit', 'next', 'prev', 'play', 'pause', 'stop', 'seek', 'openuri'];

ipcMain.on(TAG, (_, type, ...args) => {
    if (getters.includes(type)) {
        const [id, ...payload] = args;
        d('↓ %s %d', type, id);
        if (cbMap.has(id)) {
            const cb = cbMap.get(id);
            cb(null, ...payload);
        }
        return;
    }
    d('↓ %s', type);
    MPRISEmitter.emit(type, ...args);
});

function bindWebContents(wc) {
    const getterListeners = getters.map(type => cb => {
        msgId++;
        wc.send(TAG, type, msgId);
        d('↑ %s %d', type, msgId);
        cbMap.set(msgId, cb);
    });
    const dbusListeners = dbusEvents.map(type => (...args) => {
        msgId++;
        wc.send(TAG, type, msgId, ...args);
        d('↑ %s %d', type, msgId, ...args);
    });
    ipcMain.once(TAG, (_, type) => {
        if (type === 'renderer-ready') {
            d('bindWebContents');
            getters.forEach((type, index) => {
                MPRISEmitter.on(type, getterListeners[index]);
            });
            dbusEvents.forEach((type, index) => {
                MPRISEmitter.on(`dbus:${type}`, dbusListeners[index]);
            });
        }
    });
    wc.on('destroyed', () => {
        getters.forEach((type, index) => {
            MPRISEmitter.removeListener(type, getterListeners[index]);
        });
        dbusEvents.forEach((type, index) => {
            MPRISEmitter.removeListener(`dbus:${type}`, dbusListeners[index]);
        });
    });
}

module.exports = {
    MPRISEmitter,
    bindWebContents
};

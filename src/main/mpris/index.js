'use strict';

// Just let it keep going with CommonJS .......
const { ipcMain } = require('electron');

const debug = require('debug');

const MPRISEmitter = require('./mpris');

const TAG = 'MPRIS:IPC';
const d = debug(TAG);
let msgId = 0;
const cbMap = new Map();
//      dbus getter      ipc          ipc      dbus callback
// DBus ----------> Main --> Renderer --> Main ------------> DBus
const dbusGetters = ['getPosition'];
//      method/setter      ipc
// DBus ------------> Main --> Renderer
const dbusEvents = ['raise', 'quit', 'next', 'prev', 'play', 'pause', 'stop', 'seek', 'openuri'];

ipcMain.on(TAG, (_, type, ...args) => {
    if (dbusGetters.includes(type)) {
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
    const getterListeners = dbusGetters.map(type => cb => {
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
    ipcMain.once(TAG, (_, msg) => {
        if (msg === 'renderer-ready') {
            d('bindWebContents');
            dbusGetters.forEach((type, index) => {
                MPRISEmitter.on(type, getterListeners[index]);
            });
            dbusEvents.forEach((type, index) => {
                MPRISEmitter.on(`dbus:${type}`, dbusListeners[index]);
            });
        }
    });
    wc.on('destroyed', () => {
        dbusGetters.forEach((type, index) => {
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

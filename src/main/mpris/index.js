import { app, ipcMain } from 'electron';

import debug from 'debug';

import MPRISEmitter from './mpris';

const TAG = 'MPRIS:IPC';
const d = debug(TAG);
let msgId = 0;
//      method/setter      ipc
// DBus ------------> Main --> Renderer
const DBusEvents = ['raise', 'quit', 'next', 'prev', 'play', 'pause', 'stop', 'seek', 'volume', 'position'];

ipcMain.on(TAG, (_, /** @type {string} */ type, ...args) => {
    d('↓ %s', type);
    MPRISEmitter.emit(type, ...args);
});

/**
 * @param {import('electron').BrowserWindow} win 
 */
export function bindWindow(win) {
    MPRISEmitter.on('dbus:raise', () => {
        win.show();
        win.focus();
    });
    MPRISEmitter.on('dbus:quit', () => app.quit());
    bindWebContents(win.webContents);
}

/**
 * @param {import('electron').WebContents} wc
 */
export function bindWebContents(wc) {
    const dbusListeners = DBusEvents.map(type => (...args) => {
        msgId++;
        wc.send(TAG, type, msgId, ...args);
        d('↑ %s %d, %o', type, msgId, ...args);
    });
    /**
     * @param {import('electron').IpcMainEvent} _
     * @param {string} msg
     */
    const handler = (_, msg) => {
        if (msg === 'renderer-ready') {
            ipcMain.removeListener(TAG, handler);
            d('bindWebContents');
            DBusEvents.forEach((type, index) => {
                MPRISEmitter.on(`dbus:${type}`, dbusListeners[index]);
            });
        }
    };
    ipcMain.on(TAG, handler);
    wc.on('destroyed', () => {
        DBusEvents.forEach((type, index) => {
            MPRISEmitter.removeListener(`dbus:${type}`, dbusListeners[index]);
        });
    });
}

export function destroy() {
    MPRISEmitter.destroy();
}

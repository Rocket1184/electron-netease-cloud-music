'use strict';

const { contextBridge, ipcRenderer } = require('electron');
const { versions, platform } = process;

let settings = {};
try {
    const arg = '--initial-settings=';
    settings = JSON.parse(process.argv.find(v => v.startsWith(arg)).slice(arg.length));
} catch { /* ignore */ }

contextBridge.exposeInMainWorld('encm', {
    nodejsProcess: { versions, platform },
    initialSettings: settings,
    on: (tag, callback) => ipcRenderer.on(tag, callback),
    send: (tag, ...args) => ipcRenderer.send(tag, ...args),
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
});

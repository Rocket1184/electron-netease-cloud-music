'use strict';

const { contextBridge, ipcRenderer } = require('electron');
const { versions, platform } = process;

let settings;
try {
    const url = new URL(location.href);
    const arg = '#/?initial_settings=';
    if (url.hash.startsWith(arg)) {
        settings = JSON.parse(decodeURIComponent(url.hash.slice(arg.length)));
        url.hash = '';
        history.replaceState(null, '', url);
    }
} catch { /* ignore */ }

contextBridge.exposeInMainWorld('encm', {
    nodejsProcess: { versions, platform },
    initialSettings: settings,
    on: (tag, callback) => ipcRenderer.on(tag, callback),
    send: (tag, ...args) => ipcRenderer.send(tag, ...args),
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
});

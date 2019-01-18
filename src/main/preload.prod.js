'use strict';

const { remote, ipcRenderer, shell } = require('electron');
const { EventEmitter } = require('events');
const platform = require('os').platform();
const versions = process.versions;

window.require = function (id) {
    switch (id) {
        case 'electron':
            return {
                remote: {
                    getGlobal: name => name === 'process' ? { versions } : null,
                    getCurrentWindow: remote.getCurrentWindow,
                    getCurrentWebContents: remote.getCurrentWebContents
                },
                ipcRenderer: ipcRenderer,
                shell: { openExternal: shell.openExternal }
            };
        case 'os':
            return { platform: () => platform };
        case 'events':
            return { EventEmitter };
        default:
            return {};
    }
};

const arg = '--initial-settings=';
let settings = {};
try {
    settings = JSON.parse(process.argv.find(v => v.startsWith(arg)).slice(arg.length));
} finally {
    window.__NCM_SETTINGS__ = settings;
}

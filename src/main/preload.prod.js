'use strict';

const { remote, ipcRenderer, shell } = require('electron');
const { EventEmitter } = require('events');
const { versions, platform } = process;

// @ts-ignore
window.require = function (id) {
    switch (id) {
        case 'electron':
            return {
                remote: {
                    getGlobal: name => name === 'process' ? { versions, platform } : null,
                    getCurrentWindow: remote.getCurrentWindow,
                    getCurrentWebContents: remote.getCurrentWebContents
                },
                ipcRenderer: ipcRenderer,
                shell: { openExternal: shell.openExternal }
            };
        case 'events':
            return { EventEmitter };
    }
};

const arg = '--initial-settings=';
let settings = {};
try {
    settings = JSON.parse(process.argv.find(v => v.startsWith(arg)).slice(arg.length));
} finally {
    if (!sessionStorage.getItem('settings')) {
        sessionStorage.setItem('settings', JSON.stringify(settings));
    }
}

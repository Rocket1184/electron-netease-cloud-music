'use strict';

const { remote, ipcRenderer, shell } = require('electron');
const { stringify } = require('querystring');
const { EventEmitter } = require('events');
const platform = require('os').platform();

window.require = function (id) {
    switch (id) {
        case 'electron':
            const versions = process.versions;
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
        case 'querystring':
            return { stringify };
        case 'events':
            return { EventEmitter };
        default:
            return {};
    }
};

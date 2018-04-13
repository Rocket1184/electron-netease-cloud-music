'use strict';

const { remote, ipcRenderer, shell } = require('electron');
const { stringify } = require('querystring');
const platform = require('os').platform();

window.require = function (id) {
    if (id === 'electron') {
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
    } else if (id === 'os') {
        return { platform: () => platform };
    } else if (id === 'querystring') {
        return { stringify };
    }
};

const { remote, ipcRenderer, shell } = require('electron');
const { stringify } = require('querystring');
const platform = require('os').platform();

window.require = function (str) {
    if (str === 'electron') {
        const versions = process.versions;
        return {
            remote: {
                getGlobal: name => name === 'process' ? { versions } : null,
                getCurrentWindow: remote.getCurrentWindow,
                getCurrentWebContents: remote.getCurrentWebContents
            },
            ipcRenderer: ipcRenderer,
            shell: {
                openExternal: shell.openExternal
            }
        };
    } else if (str === 'os') {
        return {
            platform: () => platform
        };
    } else if (str === 'querystring') {
        return { stringify };
    }
    return {};
};

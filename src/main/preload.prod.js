const electron = require('electron');
const platform = require('os').platform();

window.require = function (str) {
    if (str === 'electron') {
        const electron = require('electron');
        return {
            remote: {
                getCurrentWindow: electron.remote.getCurrentWindow,
                getCurrentWebContents: electron.remote.getCurrentWebContents
            },
            ipcRenderer: electron.ipcRenderer
        };
    } else if (str === 'os') {
        return {
            platform: () => platform
        };
    }
    return {};
};

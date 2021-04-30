import { ipcRenderer } from 'electron';

/** @type {NodeJS.Process}*/
export const process = globalThis.process;
export const isDarwin = process.platform === 'darwin';
export const isLinux = process.platform === 'linux';

const controlMainWindow = ipcRenderer.invoke.bind(null, 'controlMainWindow');

export const browserWindow = {
    maximize: controlMainWindow.bind(null, 'maximize'),
    minimize: controlMainWindow.bind(null, 'minimize'),
    close: controlMainWindow.bind(null, 'close'),
    reload: controlMainWindow.bind(null, 'reload')
};

const controlWebContents = ipcRenderer.invoke.bind(null, 'controlWebContents');

export const webContents = {
    setZoomFactor: controlWebContents.bind(null, 'setZoomFactor'),
    openDevTools: controlWebContents.bind(null, 'openDevTools'),
    sessionGetCacheSize: controlWebContents.bind(null, 'sessionGetCacheSize'),
    sessionClearCache: controlWebContents.bind(null, 'sessionClearCache'),
    sessionClearStorage: controlWebContents.bind(null, 'sessionClearStorage')
};

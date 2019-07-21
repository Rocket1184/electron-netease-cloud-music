import { remote } from 'electron';

/** @type {NodeJS.Process}*/
export const process = remote.getGlobal('process');
export const isDarwin = process.platform === 'darwin';
export const isLinux = process.platform === 'linux';

export const browserWindow = remote.getCurrentWindow();
export const webContents = remote.getCurrentWebContents();

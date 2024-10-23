import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const fsp = fs.promises;

export const productName = 'Electron NCM';
const configDir = app.getPath('userData');
const configPath = path.join(configDir, 'settings.json');

export const defaultSettings = {
    autoPlay: false,
    autoSign: false,
    autoRefreshLogin: false,
    bitRate: 'l',
    bitRateDownload: 'ex',
    filterRcmd: false,
    startupPage: 'index',
    windowBorder: process.platform !== 'darwin',
    windowZoom: null,
    showTrayIcon: false,
    trayIconVariety: 'light',
    exitOnWindowClose: true,
    minimizeOnStartup: false,
    themePrimaryColor: '#7e57c2',
    themeSecondaryColor: '#ff4081',
    themeVariety: 'auto',
    autoReplacePlaylist: false,
    lyricTranslation: 'translation',
    titleBarShowsTrackName: true
};

/**
 * @typedef {typeof defaultSettings} Value
 * @param {Partial<Value>} value 
 * @returns {Value}
 */
function trimSettings(value) {
    const res = {};
    for (const [k, v] of Object.entries(defaultSettings)) {
        res[k] = Object.prototype.hasOwnProperty.call(value, k) ? value[k] : v;
    }
    return res;
}

function writeFile(target) {
    return fsp.writeFile(configPath, JSON.stringify(target, null, 4), 'utf8');
}

function readFile() {
    return fsp.readFile(configPath, 'utf8');
}

export async function set(target) {
    try {
        await fsp.access(configDir);
    } catch {
        fsp.mkdir(configDir);
    }
    return writeFile(target);
}

export async function get() {
    let settings = defaultSettings;
    try {
        await fsp.access(configPath);
        const json = JSON.parse(await readFile());
        settings = trimSettings(json);
    } catch {
        set(defaultSettings);
    }
    return settings;
}

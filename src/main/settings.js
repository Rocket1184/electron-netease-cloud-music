import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export const productName = 'Electron NCM';
const configDir = app.getPath('userData');
const configPath = path.join(configDir, 'settings.json');

export const defaultSettings = {
    autoPlay: false,
    autoSign: false,
    bitRate: 'l',
    windowBorder: process.platform !== 'darwin',
    windowZoom: null,
    showTrayIcon: false,
    trayIconVariety: 'light',
    exitOnWindowClose: true,
    themePrimaryColor: '#7e57c2',
    themeSecondaryColor: '#ff4081',
    themeVariety: 'light'
};

function writeFile(target) {
    fs.writeFileSync(configPath, JSON.stringify(target, null, 4), 'utf8');
}

export function get() {
    let settings = defaultSettings;
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
        writeFile(defaultSettings);
    } else if (!fs.existsSync(configPath)) {
        writeFile(defaultSettings);
    } else {
        try {
            settings = {
                ...defaultSettings,
                ...JSON.parse(fs.readFileSync(configPath).toString())
            };
            Object.keys(settings).forEach(k => {
                if (!Object.prototype.hasOwnProperty.call(defaultSettings, k)) {
                    delete settings[k];
                }
            });
            writeFile(settings);
        } catch (err) {
            writeFile(defaultSettings);
        }
    }
    return settings;
}

export function set(target) {
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
        writeFile(target);
    } else {
        writeFile(target);
    }
    return target;
}

'use strict';

import { join } from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';

import { getCurrent } from './settings';

function isDev() {
    return process.env.NODE_ENV === 'development';
}

let shouldAppQuit = true;
let mainWindow;
const winURL = isDev()
    ? `http://localhost:${require('../../script/config').devPort}`
    : `file://${__dirname}/index.html`;

let loginWindow;
let loginURL = isDev()
    ? `http://localhost:${require('../../script/config').devPort}/renderer/login.html`
    : `file://${__dirname}/login.html`;

function createWindow(url = winURL) {
    const settings = getCurrent();

    const win = new BrowserWindow({
        height: 700,
        width: 1000,
        frame: settings.windowBorder,
        titleBarStyle: settings.windowBorder ? 'default' : 'hidden',
        name: 'Electron Netease Cloud Music',
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            nodeIntegration: isDev(),
            blinkFeatures: 'OverlayScrollbars'
        }
    });

    win.loadURL(url);

    return win;
}

app.on('ready', () => {
    mainWindow = createWindow();
    // boot up ApiHost
    require('./apiHost');
});

app.on('window-all-closed', () => {
    if (shouldAppQuit && process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        mainWindow = createWindow();
    }
});

ipcMain.on('recreateWindow', (event, url) => {
    if (mainWindow) {
        shouldAppQuit = false;
        mainWindow.close();
        mainWindow = createWindow(url);
        shouldAppQuit = true;
    }
});

ipcMain.on('showLoginWindow', () => {
    loginWindow = new BrowserWindow({
        height: 700,
        width: 1150,
        name: 'Login',
        webPreferences: {
            blinkFeatures: 'OverlayScrollbars',
        },
    });
    loginWindow.loadURL(loginURL);
});

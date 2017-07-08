'use strict';

import { app, BrowserWindow, ipcMain } from 'electron';

import * as Settings from './settings';

let shouldAppQuit = true;
let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:${require('../../script/config').devPort}`
    : `file://${__dirname}/index.html`;

let loginWindow;
let loginURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:${require('../../script/config').devPort}/renderer/login.html`
    : `file://${__dirname}/login.html`;

function createWindow(url = winURL) {
    const settings = Settings.getCurrent();

    const win = new BrowserWindow({
        height: 700,
        width: 1000,
        frame: settings.windowBorder,
        titleBarStyle: settings.windowBorder ? 'default' : 'hidden',
        name: 'Electron Netease Cloud Music',
        webPreferences: {
            webSecurity: process.env.NODE_ENV !== 'development',
            blinkFeatures: 'OverlayScrollbars'
        }
    });

    win.loadURL(url);

    return win;
}

app.on('ready', () => {
    mainWindow = createWindow();
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
            webSecurity: false,
            blinkFeatures: 'OverlayScrollbars'
        }
    });
    loginWindow.loadURL(loginURL);
});

// boot up ApiHost
require('./api/apiHost');

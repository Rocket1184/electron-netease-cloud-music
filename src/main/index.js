'use strict';

import { join } from 'path';
import { app, BrowserWindow, ipcMain, Menu } from 'electron';

import { getCurrent } from './settings';
import { devPort } from '../../script/config';

const isDev = process.env.NODE_ENV === 'development';

let shouldAppQuit = true;
/** @type {BrowserWindow} */
let mainWindow;
const winURL = isDev
    ? `http://localhost:${devPort}`
    : `file://${__dirname}/index.html`;

let loginWindow;
let loginURL = isDev
    ? `http://localhost:${devPort}/login.html`
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
            nodeIntegration: isDev,
            blinkFeatures: 'OverlayScrollbars'
        }
    });

    win.on('closed', () => mainWindow = null);

    win.on('close', ev => {
        if (process.platform === 'darwin') {
            ev.preventDefault();
            win.hide();
        }
    });

    win.loadURL(url);

    return win;
}

app.on('ready', () => {
    // do not display default menu bar
    isDev ? null : Menu.setApplicationMenu(null);
    mainWindow = createWindow();
    // boot up ApiHost
    require('./apiHost');
    // boot up MPRIS host if linux
    if (process.platform === 'linux') {
        require('./mpris').bindWebContents(mainWindow.webContents);
    }
});

app.on('window-all-closed', () => {
    if (shouldAppQuit) {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (process.platform === 'darwin') {
        // quit safely on macOS
        mainWindow.removeAllListeners('close');
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        mainWindow = createWindow();
        return;
    }
    mainWindow.show();
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

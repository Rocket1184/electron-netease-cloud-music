'use strict';

import { app, BrowserWindow } from 'electron';

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:${require('../../../script/config').devPort}`
    : `file://${__dirname}/index.html`;

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 700,
        width: 1000,
        webPreferences: {
            blinkFeatures: 'OverlayScrollbars'
        },
        frame: false
    });

    mainWindow.loadURL(winURL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // eslint-disable-next-line no-console
    console.log('mainWindow opened');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// boot up ApiHost
require('./api/apihost');

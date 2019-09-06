import { join } from 'path';
import { app, BrowserWindow, ipcMain, Menu } from 'electron';

import { IsDev, IsDarwin, MainURL, LoginURL } from './util/constants';
import * as Settings from './settings';
import { AppTray } from './tray';

let shouldAppQuit = true;
/** @type {(ev: import('electron').Event) => any} */
const preventQuitHandler = ev => {
    ev.preventDefault();
    mainWindow.hide();
};
/** @type {import('electron').BrowserWindow} */
let mainWindow;
/** @type {import('electron').BrowserWindow} */
let loginWindow;
/** @type {AppTray} */
let appTray;

const MainBkgColor = {
    light: '#fafafa',
    dark: '#303030'
};

/**
 * @param {import('./settings').defaultSettings} [settings]
 * @param {string} [url]
 * @returns {import('electron').BrowserWindow}
 */
function createMainWindow(settings, url = MainURL) {
    const win = new BrowserWindow({
        height: 700,
        width: 1000,
        useContentSize: true,
        minWidth: 670,
        minHeight: 640,
        frame: settings.windowBorder,
        titleBarStyle: settings.windowBorder ? 'default' : 'hidden',
        backgroundColor: MainBkgColor[settings.themeVariety],
        title: Settings.productName,
        webPreferences: {
            zoomFactor: settings.windowZoom || 1,
            preload: join(__dirname, 'preload.js'),
            nodeIntegration: IsDev,
            nodeIntegrationInWorker: IsDev,
            contextIsolation: false,
            autoplayPolicy: 'no-user-gesture-required',
            additionalArguments: [`--initial-settings=${JSON.stringify(settings)}`]
        }
    });

    if (settings.exitOnWindowClose === false) {
        win.on('close', preventQuitHandler);
    }

    switch (process.platform) {
        case 'linux':
            try {
                require('./mpris/ipc').bindWindow(win);
            } catch (e) {
                /* eslint-disable no-console */
                console.error('Failed to load MPRIS module.');
                console.error(e);
                /* eslint-enable no-console */
            }
            break;
    }

    win.loadURL(url);
    if (IsDev) {
        win.webContents.openDevTools();
    }
    return win;
}

if (app.requestSingleInstanceLock()) {
    app.on('ready', async () => {
        const settings = await Settings.get();
        // do not display default menu bar
        if (!IsDev) {
            Menu.setApplicationMenu(null);
        }
        mainWindow = createMainWindow(settings);
        if (settings.showTrayIcon) {
            appTray = new AppTray(settings.trayIconVariety);
            appTray.bindWindow(mainWindow);
        }
        // boot up ApiHost
        require('./api/ipc');
    });
    app.on('second-instance', () => {
        mainWindow.show();
        mainWindow.focus();
    });
} else {
    app.exit();
}

app.on('window-all-closed', () => {
    if (shouldAppQuit) {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (appTray) {
        appTray.destroy();
        appTray = null;
    }
    if (mainWindow) {
        mainWindow.removeAllListeners('close');
        mainWindow.close();
    }
    if (loginWindow) {
        loginWindow.destroy();
    }
    switch (process.platform) {
        case 'linux':
            require('./mpris/ipc').destroy();
            break;
        case 'darwin':
            mainWindow.removeAllListeners('close');
            break;
    }
});

app.on('activate', () => {
    if (!mainWindow) return;
    mainWindow.show();
    mainWindow.focus();
});

ipcMain.on('Settings', async (event, /** @type {string} */ type, ...args) => {
    switch (type) {
        case 'recreateWindow':
            // prevent App quit
            shouldAppQuit = false;
            // ensure window can be closed
            mainWindow.removeAllListeners('close');
            mainWindow.close();
            mainWindow = null;
            const settings = await Settings.get();
            mainWindow = createMainWindow(settings, args[0]);
            if (appTray) {
                appTray.bindWindow(mainWindow);
            }
            shouldAppQuit = settings.exitOnWindowClose;
            break;
        case 'showTrayIcon':
            if (args[0] === true) {
                const settings = await Settings.get();
                appTray = new AppTray(settings.trayIconVariety);
                appTray.bindWindow(mainWindow);
            } else if (args[0] === false) {
                if (appTray) {
                    appTray.destroy();
                    appTray = null;
                }
            }
            break;
        case 'trayIconVariety':
            if (appTray) {
                appTray.setColor(args[0]);
            }
            break;
        case 'exitOnWindowClose':
            if (IsDarwin) return;
            shouldAppQuit = args[0];
            if (args[0] === true) {
                mainWindow.removeListener('close', preventQuitHandler);
            } else {
                mainWindow.on('close', preventQuitHandler);
            }
            break;
    }
});

ipcMain.on('showLoginWindow', () => {
    loginWindow = new BrowserWindow({
        height: 700,
        width: 1200,
        useContentSize: true,
        minHeight: 360,
        minWidth: 1080,
        title: `Login - ${Settings.productName}`,
        parent: mainWindow,
        modal: !IsDarwin,
        webPreferences: {
            nodeIntegration: false
        }
    });
    loginWindow.loadURL(LoginURL);
    const ses = loginWindow.webContents.session;
    const wr = ses.webRequest;
    wr.onCompleted({
        urls: [
            `${LoginURL}/weapi/*`
        ]
    }, (details) => {
        if (details.url.includes('/login')) {
            if (details.statusCode === 200 && Array.isArray(details.responseHeaders['set-cookie'])) {
                ipcMain.once('getLoginCookie', event => {
                    const cookie = {};
                    ses.cookies.get({ url: LoginURL }, (err, cookies) => {
                        for (const { name, value } of cookies) {
                            cookie[name] = value;
                        }
                        event.sender.send('getLoginCookie', cookie);
                        ses.clearCache(() => { });
                        ses.clearStorageData({ storages: ['cookies', 'localstorage'] });
                        loginWindow = null;
                    });
                });
                loginWindow.close();
            }
        }
    });
});

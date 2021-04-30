import { join } from 'path';
import { app, BrowserWindow, ipcMain, Menu, nativeTheme, shell } from 'electron';

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

// disable electron's poor MPRIS implementation
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');

/**
 * @param {import('./settings').defaultSettings} [settings]
 * @param {string} [url]
 * @returns {import('electron').BrowserWindow}
 */
function createMainWindow(settings, url = MainURL) {
    const windowBackgroundType = settings.themeVariety === 'auto'
        ? (nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
        : settings.themeVariety;

    const win = new BrowserWindow({
        height: 700,
        width: 1000,
        useContentSize: true,
        minWidth: 670,
        minHeight: 640,
        frame: settings.windowBorder,
        titleBarStyle: settings.windowBorder ? 'default' : 'hidden',
        backgroundColor: MainBkgColor[windowBackgroundType],
        title: Settings.productName,
        webPreferences: {
            zoomFactor: settings.windowZoom || 1,
            preload: join(__dirname, 'preload.js'),
            nodeIntegration: IsDev,
            nodeIntegrationInWorker: IsDev,
            contextIsolation: false,
            autoplayPolicy: 'no-user-gesture-required',
            disableBlinkFeatures: 'MediaSession,MediaSessionPosition,MediaSessionSeeking', // this disables `navigator.mediaSession`
            additionalArguments: [`--initial-settings=${JSON.stringify(settings)}`]
        }
    });

    if (settings.showTrayIcon && settings.minimizeOnStartup) {
        win.hide();
    }

    if (settings.exitOnWindowClose === false) {
        win.on('close', preventQuitHandler);
    }

    switch (process.platform) {
        case 'linux':
            try {
                require('./mpris/ipc').bindWindow(win);
            } catch (e) {
                console.error('Failed to load MPRIS module', e); // eslint-disable-line no-console
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
    app.allowRendererProcessReuse = true;
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
        if (!mainWindow) return;
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
    if (mainWindow) {
        mainWindow.removeListener('close', preventQuitHandler);
    }
    switch (process.platform) {
        case 'linux':
            require('./mpris/ipc').destroy();
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
            sandbox: true,
            nativeWindowOpen: true
        }
    });
    loginWindow.loadURL(LoginURL);
    const { session } = loginWindow.webContents;
    session.webRequest.onHeadersReceived({ urls: [`${LoginURL}/*`] }, (details, callback) => {
        const values = Object.entries(details.responseHeaders)
            .filter(header => header[0].toLocaleLowerCase() === 'set-cookie')
            .map(header => header[1])
            .flat();
        if (values.length <= 0 || values.every(v => !v.includes('MUSIC_U='))) {
            // no `set-cookie: MUSIC_U=...`, skip this response
            return callback({ cancel: false });
        }
        // remove webRequest listener
        session.webRequest.onHeadersReceived(null);
        ipcMain.once('getLoginCookie', event => {
            session.cookies.get({ url: LoginURL }).then(cookies => {
                const cookie = Object.fromEntries(cookies.map(ck => [ck.name, ck.value]));
                event.sender.send('getLoginCookie', cookie);
                session.clearCache();
                session.clearStorageData({ origin: LoginURL });
                loginWindow.destroy();
                loginWindow = null;
            });
        });
        callback({ cancel: false });
        loginWindow.close();
    });
});

ipcMain.handle('controlMainWindow', (event, method) => {
    switch (method) {
        case 'maximize':
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
            break;
        case 'minimize':
            mainWindow.minimize();
            break;
        case 'close':
            mainWindow.close();
            break;
        case 'reload':
            mainWindow.reload();
            break;
        default:
            break;
    }
});

ipcMain.handle('controlWebContents', async (event, method, ...args) => {
    const { webContents } = mainWindow;
    switch (method) {
        case 'setZoomFactor':
            webContents.setZoomFactor(args[0]);
            break;
        case 'openDevTools':
            webContents.openDevTools();
            break;
        case 'sessionGetCacheSize':
            return webContents.session.getCacheSize();
        case 'sessionClearCache':
            return webContents.session.clearCache();
        case 'sessionClearStorage':
            return webContents.session.clearStorageData();
    }
});

ipcMain.handle('openExternal', (event, url) => {
    return shell.openExternal(url);
});

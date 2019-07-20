import { join } from 'path';
import { EventEmitter } from 'events';
import { Tray, Menu, ipcMain, app } from 'electron';

import debug from 'debug';

const TAG = 'Tray';
const d = debug(TAG);
const IPC_TAG = `${TAG}:IPC`;
const dd = debug(IPC_TAG);

/**
 * @param {string} name
 */
function requireIcon(name) {
    let file = `${name}.png`;
    if (process.platform === 'darwin') {
        file = 'trayTemplate.png';
    }
    if (process.env.NODE_ENV === 'development') {
        return join(process.cwd(), 'assets/icons', file);
    }
    return join(__dirname, 'icons/', file);
}

/**
 * @param {string} str
 * @param {number} length
 */
function ellipsisText(str, length) {
    if (str.length <= length) return str;
    return str.substr(0, length) + '...';
}

let isKDE = false;
let isGNOME = false;
let isUnity = false;

const DesktopEnvs = [
    process.env['XDG_CURRENT_DESKTOP'] || '',
    process.env['XDG_SESSION_DESKTOP'] || ''
];

for (const env of DesktopEnvs) {
    if (env.endsWith('KDE')) {
        isKDE = true;
        break;
    }
    if (env.endsWith('GNOME')) {
        isGNOME = true;
        break;
    }
    if (env.endsWith('Unity')) {
        isUnity = true;
        break;
    }
}

export class AppTray {
    static get SendEvents() {
        return ['prev', 'next', 'playpause', 'favorite', 'dislike', 'get', 'mute'];
    }

    static get RecvEvents() {
        return ['track', 'mute'];
    }

    constructor(color = 'light') {
        this.emitter = new EventEmitter();
        const xcd = process.env.XDG_CURRENT_DESKTOP;
        const name = app.getName();
        // KDE tray icon scale hack
        if (isKDE) process.env.XDG_CURRENT_DESKTOP = 'Unity';
        // GNOME tray icon override by icon theme's Electron icon hack
        if (isGNOME || isUnity) app.setName(name.replace(/^electron/, 'whatever'));
        this.tray = new Tray(requireIcon(`tray.${color}`));
        if (isKDE) process.env.XDG_CURRENT_DESKTOP = xcd;
        if (isGNOME || isUnity) app.setName(name);
        // doesn't work when using 'appindicator'
        this.tray.on('click', () => this.emit('raise'));
        // doesn't work on KDE Plasma
        this.tray.setToolTip('Electron NCM');
        /**
         * @type {import('electron').MenuItemConstructorOptions[]}
         */
        this.controlMenu = [
            { type: 'separator' },
            { label: '⏮ 上一首', click: () => this.emit('prev') },
            { label: '⏭ 下一首', click: () => this.emit('next') },
            { label: '⏯ 播放 / 暂停', click: () => this.emit('playpause') }
        ];
        /**
         * @type {import('electron').MenuItemConstructorOptions[]}
         */
        this.exitMenu = [
            { type: 'separator' },
            { label: '显示主界面', click: () => this.emit('raise') },
            { label: '退出', click: () => this.emit('quit') }
        ];
        this.muted = false;
        /**
         * @param {import('../renderer/util/tray').TrayTrack} track
         */
        this.track = {};
        this.updateMenu();
        this.ipcListener = (_, type, ...args) => {
            dd('↓ %s %o', type, ...args);
            switch (type) {
                case 'mute':
                    this.muted = args[0];
                    break;
                case 'track':
                    this.track = args[0];
                    break;
            }
            this.updateMenu();
        };
        ipcMain.on(IPC_TAG, this.ipcListener);
    }

    /**
     * @type {import('electron').MenuItemConstructorOptions[]}
     */
    get muteMenu() {
        return [
            { label: '静音', click: () => this.emit('mute'), type: 'checkbox', checked: this.muted }
        ];
    }

    /**
     * @type {import('electron').MenuItemConstructorOptions[]}
     */
    get likeMenu() {
        if (!this.track.id) {
            return [];
        }
        return [
            { type: 'separator' },
            {
                label: '喜欢',
                type: 'checkbox',
                checked: this.track.favorite,
                enabled: this.track.canFavorite,
                click: () => this.emit('favorite', this.track.id, !this.track.favorite)
            },
            {
                label: '不感兴趣',
                enabled: this.track.canDislike,
                click: () => this.emit('dislike', this.track.id)
            },
        ];
    }

    /**
     * @type {import('electron').MenuItemConstructorOptions[]}
     */
    get trackMenu() {
        if (!this.track.id) {
            return [];
        }
        return [
            { type: 'separator' },
            { label: ellipsisText(this.track.name, 30) },
            { label: ellipsisText(`🎤 ${this.track.artist}`, 28) },
            { label: ellipsisText(`💿 ${this.track.album}`, 28) },
            { type: 'separator' },
        ];
    }

    /**
     * set tray icon color
     * @param {'light'|'dark'} color
     */
    setColor(color) {
        if (color === 'light' || color === 'dark') {
            this.tray.setImage(requireIcon(`tray.${color}`));
        }
    }

    /**
     * @param {string} event
     * @param {...any} args 
     */
    emit(event, ...args) {
        d('%s %o', event, args);
        this.emitter.emit(event, ...args);
    }

    updateMenu() {
        const tmpl = this.likeMenu.concat(this.controlMenu, this.muteMenu, this.trackMenu, this.exitMenu);
        const menu = Menu.buildFromTemplate(tmpl);
        this.tray.setContextMenu(menu);
    }

    /**
     * @param {import('electron').BrowserWindow} win 
     */
    bindWindow(win) {
        this.emitter.on('raise', () => {
            win.show();
            win.focus();
        });
        this.emitter.on('quit', () => {
            win.removeAllListeners('close');
            win.close();
            this.destroy();
            app.quit();
        });
        this.bindWebContents(win.webContents);
    }

    /**
     * @param {import('electron').webContents} wc 
     */
    bindWebContents(wc) {
        const sendListeners = AppTray.SendEvents.map(type => (...args) => {
            dd('↑ %s %o', type, ...args);
            wc.send(IPC_TAG, type, ...args);
        });
        AppTray.SendEvents.forEach((type, index) => this.emitter.on(type, sendListeners[index]));
        const wcDestroyListener = () => AppTray.SendEvents.forEach((type, index) => {
            this.emitter.removeListener(type, sendListeners[index]);
        });
        wc.on('destroyed', wcDestroyListener);
        this.emitter.on('destroy', () => {
            wc.removeListener('destroyed', wcDestroyListener);
            wcDestroyListener();
        });
        this.emit('get');
    }

    destroy() {
        this.emit('destroy');
        this.tray.destroy();
        this.tray = null;
        ipcMain.removeListener(IPC_TAG, this.ipcListener);
    }
}

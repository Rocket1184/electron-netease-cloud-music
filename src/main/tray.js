import { join } from 'path';
import { EventEmitter } from 'events';
import { Tray, Menu, ipcMain, app } from 'electron';

import debug from 'debug';

const TAG = 'Tray';
const d = debug(TAG);
const IPC_TAG = `${TAG}:IPC`;
const dd = debug(IPC_TAG);

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

function ellipsisText(str, length) {
    if (str.length <= length) return str;
    return str.substr(0, length) + '...';
}

const isKDE = [
    process.env['XDG_CURRENT_DESKTOP'] || '',
    process.env['XDG_SESSION_DESKTOP'] || ''
].some(s => s.toUpperCase().endsWith('KDE'));

export class AppTray {
    static get SendEvents() {
        return ['prev', 'next', 'playpause', 'favorite', 'dislike', 'get'];
    }

    static get RecvEvents() {
        return ['track'];
    }

    constructor(color = 'light') {
        this.emitter = new EventEmitter();
        const xcd = process.env.XDG_CURRENT_DESKTOP;
        // KDE tray icon scale hack
        if (isKDE) process.env.XDG_CURRENT_DESKTOP = 'Unity';
        this.tray = new Tray(requireIcon(`tray.${color}`));
        if (isKDE) process.env.XDG_CURRENT_DESKTOP = xcd;
        // doesn't work when using 'appindicator'
        this.tray.on('click', () => this.emit('raise'));
        // doesn't work on KDE Plasma
        this.tray.setToolTip('Electron NCM');
        this.menuTemplate = [
            { label: '显示主界面', click: () => this.emit('raise') },
            { label: '退出', click: () => this.emit('quit') },
            { type: 'separator' },
            { label: '⏮ 上一首', click: () => this.emit('prev') },
            { label: '⏭ 下一首', click: () => this.emit('next') },
            { label: '⏯ 播放 / 暂停', click: () => this.emit('playpause') },
            { type: 'separator' },
        ];
        this.trackMenu = [];
        this.updateMenu();
        this.ipcListener = (_, type, ...args) => {
            dd('↓ %s %o', type, ...args);
            if (type === 'track') {
                this.setTrack(args[0]);
            }
        };
        ipcMain.on(IPC_TAG, this.ipcListener);
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

    setTrack(track) {
        if (!track.id) {
            this.trackMenu = [];
            return;
        }
        this.trackMenu = [
            { label: ellipsisText(track.name, 30) },
            { label: ellipsisText(`🎤 ${track.artist}`, 28) },
            { label: ellipsisText(`💿 ${track.album}`, 28) },
            { type: 'separator' },
            {
                label: '喜欢',
                type: 'checkbox',
                checked: track.favorite,
                enabled: track.canFavorite,
                click: () => this.emit('favorite', track.id)
            },
            {
                label: '不感兴趣',
                enabled: track.canDislike,
                click: () => this.emit('dislike', track.id)
            },
        ];
        this.updateMenu();
    }

    updateMenu() {
        const tmpl = this.menuTemplate.concat(this.trackMenu);
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

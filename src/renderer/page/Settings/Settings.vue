<template>
    <div class="ncm-page">
        <div class="settings">
            <mu-list toggle-nested
                :nested-indent="false">
                <mu-sub-header>主题</mu-sub-header>
                <mu-list-item button
                    @click="primaryPickerOpen = true">
                    <mu-list-item-title>主题色</mu-list-item-title>
                    <ColorPicker :open.sync="primaryPickerOpen"
                        @select="setThemeVariable('themePrimaryColor', $event)"></ColorPicker>
                    <mu-list-item-action>
                        <mu-avatar :size="24"
                            :color="settings.themePrimaryColor"></mu-avatar>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-list-item button
                    @click="secondaryPickerOpen = true">
                    <mu-list-item-title>强调色</mu-list-item-title>
                    <ColorPicker :open.sync="secondaryPickerOpen"
                        @select="setThemeVariable('themeSecondaryColor', $event)"></ColorPicker>
                    <mu-list-item-action>
                        <mu-avatar :size="24"
                            :color="settings.themeSecondaryColor"></mu-avatar>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-list-item>
                    <mu-list-item-title>背景色</mu-list-item-title>
                    <mu-list-item-action>
                        <mu-select :value="settings.themeVariety"
                            @change="setThemeVariable('themeVariety', $event)">
                            <mu-option label="亮色"
                                value="light"></mu-option>
                            <mu-option label="暗色"
                                value="dark"></mu-option>
                        </mu-select>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-sub-header>行为</mu-sub-header>
                <mu-list-item @click="setWindowZoom">
                    <mu-list-item-title>界面缩放</mu-list-item-title>
                    <mu-list-item-action>
                        <mu-select :value="settings.windowZoom"
                            @change="setWindowZoom($event)">
                            <mu-option label="跟随系统"
                                :value="null"></mu-option>
                            <mu-option label="1x"
                                :value="1"></mu-option>
                            <mu-option label="1.25x"
                                :value="1.25"></mu-option>
                            <mu-option label="1.5x"
                                :value="1.5"></mu-option>
                            <mu-option label="1.75x"
                                :value="1.75"></mu-option>
                            <mu-option label="2x"
                                :value="2"></mu-option>
                        </mu-select>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-list-item button
                    @click="toggleWindowBorder()">
                    <mu-list-item-title>使用系统标题栏</mu-list-item-title>
                    <mu-list-item-action>
                        <mu-switch :inputValue="settings.windowBorder"
                            color="secondary"></mu-switch>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-list-item button
                    nested
                    :open="!isDarwin && settings.showTrayIcon"
                    @click="toggleTrayIcon()">
                    <mu-list-item-title>显示托盘图标</mu-list-item-title>
                    <mu-list-item-action>
                        <mu-switch :inputValue="settings.showTrayIcon"
                            color="secondary"></mu-switch>
                    </mu-list-item-action>
                    <template #nested>
                        <mu-list-item>
                            <mu-list-item-title>托盘图标颜色</mu-list-item-title>
                            <mu-list-item-action>
                                <mu-select :value="settings.trayIconVariety"
                                    @change="setIPCVariable('trayIconVariety', $event)">
                                    <mu-option label="亮色"
                                        value="light"></mu-option>
                                    <mu-option label="暗色"
                                        value="dark"></mu-option>
                                </mu-select>
                            </mu-list-item-action>
                        </mu-list-item>
                        <mu-list-item>
                            <mu-list-item-title>关闭窗口时</mu-list-item-title>
                            <mu-list-item-action>
                                <mu-select :value="settings.exitOnWindowClose"
                                    @change="setIPCVariable('exitOnWindowClose', $event)">
                                    <mu-option label="退出程序"
                                        :value="true"></mu-option>
                                    <mu-option label="最小化到托盘"
                                        :value="false"></mu-option>
                                </mu-select>
                            </mu-list-item-action>
                        </mu-list-item>
                    </template>
                </mu-list-item>
                <mu-sub-header>播放</mu-sub-header>
                <mu-list-item>
                    <mu-list-item-title>音频码率</mu-list-item-title>
                    <mu-list-item-action>
                        <mu-select :value="settings.bitRate"
                            @change="setByName('bitRate', $event)">
                            <mu-option label="极高 (320 kbit/s)"
                                value="h"></mu-option>
                            <mu-option label="较高 (192 kbit/s)"
                                value="m"></mu-option>
                            <mu-option label="标准 (128 kbit/s)"
                                value="l"></mu-option>
                        </mu-select>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-list-item button
                    @click="toggleByName('autoPlay')">
                    <mu-list-item-title>启动时自动开始播放</mu-list-item-title>
                    <mu-list-item-action>
                        <mu-switch :inputValue="settings.autoPlay"
                            color="secondary"></mu-switch>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-sub-header>特性</mu-sub-header>
                <mu-list-item button
                    @click="toggleByName('autoSign')">
                    <mu-list-item-title>自动签到</mu-list-item-title>
                    <mu-list-item-action>
                        <mu-switch :inputValue="settings.autoSign"
                            color="secondary"></mu-switch>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-sub-header>存储</mu-sub-header>
                <mu-list-item button
                    @click="promptClearCache('chrome')">
                    <mu-list-item-title>浏览器缓存</mu-list-item-title>
                    <mu-list-item-action>
                        <span class="nowrap">{{cacheSize | humanSize}}</span>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-list-item button
                    @click="promptClearCache('music')">
                    <mu-list-item-title>歌曲缓存</mu-list-item-title>
                    <mu-list-item-action>
                        <span class="nowrap">{{musicSize | humanSize}}</span>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-list-item button
                    @click="promptClearCache('lyric')">
                    <mu-list-item-title>歌词缓存</mu-list-item-title>
                    <mu-list-item-action>
                        <span class="nowrap">{{lyricSize | humanSize}}</span>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-list-item button
                    @click="promptWipeAppData()">
                    <mu-list-item-title>所有应用数据</mu-list-item-title>
                    <mu-list-item-action>
                        <span class="nowrap">{{dataSize | humanSize}}</span>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-sub-header>调试</mu-sub-header>
                <mu-list-item button
                    @click="launchDevTools">
                    <mu-list-item-title>启动开发者工具</mu-list-item-title>
                </mu-list-item>
                <mu-list-item button
                    @click="reloadWindow">
                    <mu-list-item-title>重新载入页面</mu-list-item-title>
                </mu-list-item>
                <mu-list-item button
                    @click="recreateWindow">
                    <mu-list-item-title>重新创建窗口</mu-list-item-title>
                </mu-list-item>
                <mu-sub-header>关于</mu-sub-header>
                <mu-list-item button
                    @click="showVersions">
                    <mu-list-item-title>版本号</mu-list-item-title>
                    <mu-list-item-action>
                        <span class="nowrap">{{versionName}}</span>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-list-item button
                    @click="openBrowser('https://github.com/rocket1184/electron-netease-cloud-music')">
                    <mu-list-item-title>获取源代码</mu-list-item-title>
                </mu-list-item>
            </mu-list>
        </div>
    </div>
</template>

<script>
import { platform } from 'os';
import { ipcRenderer, remote, shell } from 'electron';
import { mapState, mapActions } from 'vuex';

import Api from '@/api/ipc';
import { setTheme } from '@/util/theme';
import ColorPicker from './ColorPicker.vue';
import { humanSize } from '@/util/formatter';

const TAG = 'Settings';
const browserWindow = remote.getCurrentWindow();
const webContents = remote.getCurrentWebContents();

const CacheName = {
    chrome: '浏览器',
    music: '歌曲',
    lyric: '歌词'
};

const CacheClearFunc = {
    chrome: resolve => webContents.session.clearCache(() => resolve(true)),
    music: resolve => Api.clearCache('music').then(() => resolve(true)),
    lyric: resolve => Api.clearCache('lyric').then(() => resolve(true)),
};

const versions = remote.getGlobal('process').versions;

const ver = `Electron: ${versions.electron}
Chrome: ${versions.chrome}
Node: ${versions.node}
V8: ${versions.v8}`;

export default {
    name: 'page-settings',
    data() {
        return {
            isDarwin: platform() === 'darwin',
            primaryPickerOpen: false,
            secondaryPickerOpen: false,
            cacheSize: 0,
            musicSize: 0,
            lyricSize: 0,
            dataSize: 0,
            versionName: ''
        };
    },
    computed: {
        ...mapState(['settings'])
    },
    methods: {
        ...mapActions([
            'updateSettings',
            'resetSettings'
        ]),
        refreshSize() {
            webContents.session.getCacheSize(s => this.cacheSize = s);
            Api.getDataSize('all').then(s => this.dataSize = s.size);
            Api.getDataSize('music').then(s => this.musicSize = s.size);
            Api.getDataSize('lyric').then(s => this.lyricSize = s.size);
        },
        toggleByName(name) {
            const val = !this.settings[name];
            return this.updateSettings({ [name]: val });
        },
        async toggleWindowBorder() {
            await this.toggleByName('windowBorder');
            this.$nextTick(() => this.recreateWindow());
        },
        setByName(name, val) {
            if (this.settings[name] === val) return;
            return this.updateSettings({ [name]: val });
        },
        async setThemeVariable(name, val) {
            await this.setByName(name, val);
            setTheme({
                primary: this.settings.themePrimaryColor,
                secondary: this.settings.themeSecondaryColor
            }, this.settings.themeVariety);
        },
        setWindowZoom(val) {
            this.setByName('windowZoom', val);
            webContents.setZoomFactor(val || 1);
        },
        setIPCVariable(name, val) {
            this.setByName(name, val);
            ipcRenderer.send(TAG, name, val);
        },
        async toggleTrayIcon() {
            const shouldShowTrayIcon = !this.settings.showTrayIcon;
            this.setIPCVariable('showTrayIcon', shouldShowTrayIcon);
            if (shouldShowTrayIcon === false) {
                this.setIPCVariable('exitOnWindowClose', true);
            }
        },
        async clearStorage() {
            return new Promise(resolve => webContents.session.clearStorageData(resolve));
        },
        clearCache(type) {
            return new Promise((resolve, reject) => {
                const func = CacheClearFunc[type];
                if (func) {
                    func(resolve);
                } else {
                    reject();
                }
            });
        },
        promptClearCache(type) {
            const cacheName = CacheName[type];
            this.$confirm(
                `${cacheName}缓存将被清除，确定吗？`,
                '清除缓存',
            ).then(msgReturn => {
                if (msgReturn.result === true) {
                    return this.clearCache(type);
                }
                return Promise.reject();
            }).then(result => {
                if (result === true) {
                    this.$toast.message(`${cacheName}缓存清除完成`);
                    this.refreshSize();
                }
            });
        },
        promptWipeAppData() {
            this.$confirm(
                '所有应用数据都将被清除，包括缓存以及账号登录状态，之后窗口将重新加载。确定吗？',
                '清除所有应用数据'
            ).then(msgReturn => {
                if (msgReturn.result === true) {
                    window.onbeforeunload = null;
                    Promise.all([
                        Api.updateCookie(),
                        this.clearStorage(),
                        this.resetSettings(),
                        this.clearCache('music'),
                        this.clearCache('lyric'),
                        this.clearCache('chrome'),
                    ]).then(() => this.recreateWindow());
                }
            });
        },
        launchDevTools() {
            browserWindow.openDevTools();
        },
        reloadWindow() {
            browserWindow.reload();
        },
        recreateWindow() {
            ipcRenderer.send(TAG, 'recreateWindow');
        },
        openBrowser(url) {
            try {
                shell.openExternal(url);
            } catch (err) {
                this.$alert(`无法打开您的浏览器，请直接访问 ${url}`, '提示');
            }
        },
        showVersions() {
            this.$alert(h => h('pre', { class: 'mono-font' }, ver), '版本号');
        }
    },
    filters: {
        humanSize
    },
    beforeCreate() {
        Api.getVersionName().then(v => this.versionName = v);
    },
    activated() {
        this.refreshSize();
    },
    components: {
        ColorPicker
    }
};
</script>

<style lang="less">
.settings {
    max-width: 600px;
    margin: 0 auto 100px;
    user-select: none;
    .nowrap {
        white-space: nowrap;
    }
    .mu-item-action {
        .mu-input {
            margin: 0;
            padding: 0;
            min-height: unset;
        }
    }
}
</style>

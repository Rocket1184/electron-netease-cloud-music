<template>
    <div class="settings">
        <mu-list>
            <mu-sub-header>基本设置</mu-sub-header>
            <mu-list-item>
                <mu-list-item-title>试听音频码率</mu-list-item-title>
                <mu-list-item-action>
                    <mu-select v-model="settings.bitRate">
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
                @click="toggleByName('windowBorder')">
                <mu-list-item-title>使用系统标题栏</mu-list-item-title>
                <mu-list-item-action>
                    <mu-switch v-model="settings.windowBorder"
                        color="secondary"
                        readonly></mu-switch>
                </mu-list-item-action>
            </mu-list-item>
            <mu-list-item button
                @click="toggleByName('autoPlay')">
                <mu-list-item-title>启动时自动开始播放</mu-list-item-title>
                <mu-list-item-action>
                    <mu-switch v-model="settings.autoPlay"
                        color="secondary"
                        readonly></mu-switch>
                </mu-list-item-action>
            </mu-list-item>
            <mu-list-item button
                @click="primaryPickerOpen = true">
                <mu-list-item-title>主色调</mu-list-item-title>
                <ColorPicker :open.sync="primaryPickerOpen"
                    @select="setByName('themePrimaryColor', $event)"></ColorPicker>
                <mu-list-item-action>
                    <mu-avatar :size="24"
                        :color="settings.themePrimaryColor"></mu-avatar>
                </mu-list-item-action>
            </mu-list-item>
            <mu-list-item button
                @click="secondaryPickerOpen = true">
                <mu-list-item-title>强调色</mu-list-item-title>
                <ColorPicker :open.sync="secondaryPickerOpen"
                    @select="setByName('themeSecondaryColor', $event)"></ColorPicker>
                <mu-list-item-action>
                    <mu-avatar :size="24"
                        :color="settings.themeSecondaryColor"></mu-avatar>
                </mu-list-item-action>
            </mu-list-item>
            <mu-list-item>
                <mu-list-item-title>背景色调</mu-list-item-title>
                <mu-list-item-action>
                    <mu-select v-model="settings.themeVariety"
                        @change="changeTheme">
                        <mu-option label="亮色"
                            value="light"></mu-option>
                        <mu-option label="暗色"
                            value="dark"></mu-option>
                    </mu-select>
                </mu-list-item-action>
            </mu-list-item>
            <mu-sub-header>存储空间</mu-sub-header>
            <mu-list-item button
                @click="clearCache('chrome')">
                <mu-list-item-title>浏览器缓存</mu-list-item-title>
                <mu-list-item-action>
                    <span class="nowrap">{{cacheSize | humanSize}}</span>
                </mu-list-item-action>
            </mu-list-item>
            <mu-list-item button
                @click="clearCache('music')">
                <mu-list-item-title>歌曲缓存</mu-list-item-title>
                <mu-list-item-action>
                    <span class="nowrap">{{musicSize | humanSize}}</span>
                </mu-list-item-action>
            </mu-list-item>
            <mu-list-item button
                @click="clearCache('lyric')">
                <mu-list-item-title>歌词缓存</mu-list-item-title>
                <mu-list-item-action>
                    <span class="nowrap">{{lyricSize | humanSize}}</span>
                </mu-list-item-action>
            </mu-list-item>
            <mu-list-item button
                @click="wipeAppData">
                <mu-list-item-title>所有应用数据</mu-list-item-title>
                <mu-list-item-action>
                    <span class="nowrap">{{dataSize | humanSize}}</span>
                </mu-list-item-action>
            </mu-list-item>
            <mu-sub-header>高级设置</mu-sub-header>
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
</template>

<script>
import { ipcRenderer, remote, shell } from 'electron';
import MuseUI from 'muse-ui';

import ColorPicker from './ColorPicker.vue';
import * as types from '@/vuex/mutation-types';
import Api from '@/util/api';
import { humanSize } from '@/util/formatter';

const versions = remote.getGlobal('process').versions;

const ver = `Electron: ${versions.electron}
Chrome: ${versions.chrome}
Node: ${versions.node}
V8: ${versions.v8}`;

export default {
    name: 'page-settings',
    data() {
        return {
            primaryPickerOpen: false,
            secondaryPickerOpen: false,
            cacheSize: 0,
            musicSize: 0,
            lyricSize: 0,
            dataSize: 0,
            versionName: '',
            settings: {}
        };
    },
    methods: {
        refreshSize() {
            remote.getCurrentWebContents().session.getCacheSize(s => this.cacheSize = s);
            Api.getDataSize('all').then(s => this.dataSize = s.size);
            Api.getDataSize('music').then(s => this.musicSize = s.size);
            Api.getDataSize('lyric').then(s => this.lyricSize = s.size);
        },
        saveSettings() {
            this.$store.commit(types.UPDATE_SETTINGS, this.settings);
            this.$store.commit(types.WRITE_SETTINGS);
            this.$toast.message('设置已保存');
        },
        toggleByName(name) {
            if (typeof this.settings[name] === 'boolean') {
                this.settings[name] = !this.settings[name];
            }
        },
        setByName(name, val) {
            if (this.settings[name] !== undefined) {
                this.settings[name] = val;
            }
            if (name.startsWith('theme')) {
                this.changeTheme();
            }
        },
        changeTheme() {
            const id = Date.now();
            MuseUI.theme.add(id, {
                primary: this.settings.themePrimaryColor,
                secondary: this.settings.themeSecondaryColor
            }, this.settings.themeVariety).use(id);
        },
        async clearStorage() {
            return new Promise(resolve => remote.getCurrentWebContents().session.clearStorageData({
                storages: ['appcache', 'cookies', 'localstorage']
            }, resolve));
        },
        clearCache(type) {
            const cacheName = {
                chrome: '浏览器',
                music: '歌曲',
                lyric: '歌词'
            }[type];
            this.$confirm(
                `${cacheName}缓存将被清除，确定吗？`,
                '清除缓存',
            ).then(({ result }) => {
                if (result) {
                    switch (type) {
                        case 'chrome':
                            remote.getCurrentWebContents().session.clearCache(() => {
                                this.$toast.message('浏览器缓存清除完成');
                            });
                            break;
                        case 'music':
                            Api.clearCache('music')
                                .then(() => this.$toast.message('歌曲缓存清除完成'));
                            break;
                        case 'lyric':
                            Api.clearCache('lyric')
                                .then(() => this.$toast.message('歌词缓存清除完成'));
                            break;
                        default:
                            this.$toast.message('搞啥呢？？？');
                    }
                    this.refreshSize();
                }
            });
        },
        wipeAppData() {
            this.$confirm(
                '所有应用数据都将被清除，包括缓存以及账号登录状态，之后窗口将重新加载。确定吗？',
                '清除所有应用数据'
            ).then(({ result }) => {
                if (result) {
                    window.onbeforeunload = null;
                    Promise.all([
                        this.clearStorage(),
                        // clear cookies
                        Api.updateCookie({}),
                        Api.resetSettings(),
                        this.clearCache('chrome'),
                        this.clearCache('music'),
                        this.clearCache('lyric'),
                    ]).then(() => this.recreateWindow());
                }
            });
        },
        launchDevTools() {
            remote.getCurrentWindow().openDevTools();
        },
        reloadWindow() {
            remote.getCurrentWindow().reload();
        },
        recreateWindow() {
            ipcRenderer.send('recreateWindow');
        },
        openBrowser(url) {
            try {
                shell.openExternal(url);
            } catch (err) {
                this.$alert(`无法打开您的浏览器，请直接访问 ${url}`, '提示');
            }
        },
        showVersions() {
            this.$alert(
                // class 'mono-font' was declared in file 'App.vue'
                h => h('pre', { class: 'mono-font' }, ver),
                '版本号'
            );
        }
    },
    filters: {
        humanSize
    },
    watch: {
        ['settings']: {
            deep: true,
            handler(val, oldVal) {
                if (Object.keys(oldVal).length !== 0) {
                    this.saveSettings();
                }
            }
        },
        ['settings.windowBorder'](val, oldVal) {
            if (oldVal !== undefined) {
                this.$store.commit(types.WRITE_SETTINGS);
                this.$nextTick(() => ipcRenderer.send('recreateWindow', location.href));
            }
        }
    },
    components: {
        ColorPicker
    },
    beforeCreate() {
        Api.getCurrentSettings().then(s => this.settings = s);
        Api.getVersionName().then(v => this.versionName = v);
    },
    activated() {
        this.refreshSize();
    }
};
</script>

<style lang="less">
.settings {
    max-width: 600px;
    margin: 0 auto 100px;
    .margin-block {
        margin: 4px 16px;
    }
    .nowrap {
        white-space: nowrap;
    }
}
</style>

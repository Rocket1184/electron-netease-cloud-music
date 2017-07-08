<template>
    <div class="settings">
        <mu-sub-header>基本设置</mu-sub-header>
        <mu-list-item title="试听音质"
            disableRipple></mu-list-item>
        <div class="margin-block">
            <mu-radio label="高 (320 kbit/s)"
                name="bitRate"
                nativeValue="h"
                v-model="settings.bitRate"></mu-radio>
            <br>
            <mu-radio label="中 (160 kbit/s)"
                name="bitRate"
                nativeValue="m"
                v-model="settings.bitRate"></mu-radio>
            <br>
            <mu-radio label="低 (96 kbit/s)"
                name="bitRate"
                nativeValue="l"
                v-model="settings.bitRate"></mu-radio>
        </div>
        <mu-list-item title="使用系统标题栏"
            @click="toggleByName('windowBorder')"
            disableRipple>
            <mu-switch v-model="settings.windowBorder"
                slot="right"></mu-switch>
        </mu-list-item>
        <mu-list-item title="启动时自动开始播放"
            @click="toggleByName('autoPlay')"
            disableRipple>
            <mu-switch v-model="settings.autoPlay"
                slot="right"></mu-switch>
        </mu-list-item>
        <mu-sub-header>缓存管理</mu-sub-header>
        <mu-list-item title="清除浏览器缓存"
            @click="clearCache('chrome')"
            disableRipple>
            <span slot="right"
                class="nowrap">{{cacheSize | hunamSize}}</span>
        </mu-list-item>
        <mu-list-item title="清除歌曲缓存"
            @click="clearCache('music')"
            disableRipple>
            <span slot="right"
                class="nowrap">{{musicSize | hunamSize}}</span>
        </mu-list-item>
        <mu-list-item title="清除歌词缓存"
            @click="clearCache('lyric')"
            disableRipple>
            <span slot="right"
                class="nowrap">{{lyricSize | hunamSize}}</span>
        </mu-list-item>
        <mu-list-item title="清除所有应用数据"
            @click="wipeAppData"
            disableRipple>
            <span slot="right"
                class="nowrap">{{dataSize | hunamSize}}</span>
        </mu-list-item>
        <mu-sub-header>高级设置</mu-sub-header>
        <mu-list-item title="启动开发者工具"
            @click="launchDevTools"
            disableRipple></mu-list-item>
        <mu-list-item title="重新载入窗口"
            @click="reloadWindow"
            disableRipple></mu-list-item>
        <mu-sub-header>关于</mu-sub-header>
        <mu-list-item title="版本号"
            @click="showVersions">
            <span slot="right"
                class="nowrap">{{versionName}}</span>
        </mu-list-item>
        <mu-list-item title="获取源代码"
            @click="openBrowser('https://github.com/rocket1184/electron-netease-cloud-music')"
            disableRipple></mu-list-item>
        <!-- - - - - - - - - -  dialog below - - - - - - - - -  -->
        <mu-dialog :open="prompt"
            :title="promptTitle">
            <div v-html="promptText"></div>
            <mu-flat-button slot="actions"
                @click="prompt=false"
                primary
                label="取消"></mu-flat-button>
            <mu-flat-button slot="actions"
                primary
                @click="promptAction"
                label="确定"></mu-flat-button>
        </mu-dialog>
    </div>
</template>

<script>
import { ipcRenderer, remote, shell } from 'electron';

import * as types from '../vuex/mutation-types';
import ApiRenderer from '../util/apiRenderer';

export default {
    data() {
        return {
            prompt: false,
            promptTitle: '',
            promptText: '',
            promptAction: () => { },
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
            ApiRenderer.getDataSize().then(s => this.dataSize = s);
            ApiRenderer.getDataSize('music').then(s => this.musicSize = s);
            ApiRenderer.getDataSize('lyric').then(s => this.lyricSize = s);
        },
        toggleByName(name) {
            if (typeof this.settings[name] === 'boolean') {
                this.settings[name] = !this.settings[name];
            }
        },
        async clearStorage() {
            return new Promise(resolve => this.session.clearStorageData({
                storages: ['appcache', 'cookies', 'localstorage']
            }, resolve));
        },
        clearCache(type) {
            switch (type) {
                case 'chrome':
                    remote.getCurrentWebContents().session.clearCache(() => {
                        this.refreshSize();
                        this.$toast('成功清除浏览器缓存');
                    });
                    break;
                case 'music':
                    ApiRenderer.clearCache('music')
                        .then(() => this.$toast('成功清除歌曲缓存'));
                    break;
                case 'lyric':
                    ApiRenderer.clearCache('lyric')
                        .then(() => this.$toast('成功清除歌词缓存'));
                    break;
                default:
                    this.$toast('搞啥呢？？？');
            }
            this.refreshSize();
        },
        wipeAppData() {
            this.showPrompt({
                title: '提示',
                text: '这将清除所有应用数据，包括缓存以及账号登录状态，确定吗？',
                action: async () => {
                    await this.clearStorage();
                    window.onbeforeunload = null;
                    ApiRenderer.updateCookie({});
                    ApiRenderer.resetSettings();
                    ApiRenderer.clearCache('all');
                    ipcRenderer.send('recreateWindow');
                }
            });
        },
        launchDevTools() {
            remote.getCurrentWindow().openDevTools();
        },
        reloadWindow() {
            remote.getCurrentWindow().reload();
        },
        openBrowser(url) {
            try {
                shell.openExternal(url);
            } catch (err) {
                this.showPrompt({
                    title: '提示',
                    text: `无法打开您的浏览器，请直接访问 ${url}`,
                    action: () => { }
                });
            }
        },
        showVersions() {
            this.showPrompt({
                title: '版本号',
                text: `<pre>
                    Electron: ${process.versions.electron}
                    Chrome: ${process.versions.chrome}
                    Node: ${process.versions.node}
                    V8: ${process.versions.v8}
                </pre>`,
                action: () => { }
            });
        },
        showPrompt(cfg) {
            this.prompt = true;
            this.promptTitle = cfg.title;
            this.promptText = cfg.text;
            this.promptAction = async () => {
                await cfg.action();
                this.prompt = false;
            };
        }
    },
    filters: {
        hunamSize(val) {
            let i;
            const unit = ['', 'K', 'M', 'G', 'T'];
            for (i = 0; i < unit.length; i++) {
                if (val < 1000) break;
                else val /= 1024;
            }
            return `${val.toFixed(1)} ${unit[i]}B`;
        }
    },
    watch: {
        settings: {
            deep: true,
            handler: function (val, oldVal) {
                if (Object.keys(oldVal).length !== 0) {
                    this.$store.commit(types.UPDATE_SETTINGS, val);
                    this.$store.commit(types.WRITE_SETTINGS);
                    this.$toast('设置已保存');
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
    beforeCreate() {
        ApiRenderer.getCurrentSettings().then(s => this.settings = s);
        ApiRenderer.getVersionName().then(v => this.versionName = v);
    },
    activated() {
        this.refreshSize();
    }
};
</script>

<style lang="less">
.settings {
    width: 600px;
    margin-left: calc(~"50% - 300px");
    margin-bottom: 100px;
    .margin-block {
        margin: 4px 16px;
    }
    .nowrap {
        white-space: nowrap;
    }
}
</style>

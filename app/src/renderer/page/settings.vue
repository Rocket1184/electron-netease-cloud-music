<template>
    <div class="settings">
        <mu-sub-header>基本设置</mu-sub-header>
        <mu-list-item title="试听音质"
                      disableRipple />
        <div class="margin-block">
            <mu-radio label="高 (320 kbit/s)"
                      name="bitRate"
                      nativeValue="h"
                      v-model="settings.bitRate" />
            <br/>
            <mu-radio label="中 (160 kbit/s)"
                      name="bitRate"
                      nativeValue="m"
                      v-model="settings.bitRate" />
            <br/>
            <mu-radio label="低 (96 kbit/s)"
                      name="bitRate"
                      nativeValue="l"
                      v-model="settings.bitRate" />
        </div>
        <mu-list-item title="使用系统标题栏"
                      @click="toggleByName('windowBorder')"
                      disableRipple>
            <mu-switch v-model="settings.windowBorder"
                       slot="right" />
        </mu-list-item>
        <mu-list-item title="启动时自动开始播放"
                      @click="toggleByName('autoPlay')"
                      disableRipple>
            <mu-switch v-model="settings.autoPlay"
                       slot="right" />
        </mu-list-item>
        <mu-sub-header>高级设置</mu-sub-header>
        <mu-list-item title="清除缓存"
                      @click="clearCache"
                      disableRipple>
            <span slot="right"
                  class="nowrap">{{cacheSize | hunamSize}}</span>
        </mu-list-item>
        <mu-list-item title="清除所有应用数据"
                      @click="wipeAppData"
                      disableRipple>
            <span slot="right"
                  class="nowrap">{{dataSize | hunamSize}}</span>
        </mu-list-item>
        <mu-list-item title="启动开发者工具"
                      @click="launchDevTools"
                      disableRipple/>
        <mu-list-item title="重新载入窗口"
                      @click="reloadWindow"
                      disableRipple/>
        <mu-sub-header>关于</mu-sub-header>
        <mu-list-item title="版本号">
            <span slot="right"
                  class="nowrap">{{versionName}}</span>
        </mu-list-item>
        <mu-list-item title="获取源代码"
                      @click="openBrowser('https://github.com/rocket1184/electron-netease-cloud-music')"
                      disableRipple />
        <!-- - - - - - - - - -  dialog below - - - - - - - - -  -->
        <mu-dialog :open="prompt"
                   :title="promptTitle">
            {{promptText}}
            <mu-flat-button slot="actions"
                            @click="prompt=false"
                            primary
                            label="取消" />
            <mu-flat-button slot="actions"
                            primary
                            @click="promptAction"
                            label="确定" />
        </mu-dialog>
    </div>
</template>

<script>
import qs from 'child_process';
import { ipcRenderer, remote } from 'electron';

import * as types from '../vuex/mutation-types';
import ApiRenderer from '../util/apirenderer';

export default {
    data() {
        return {
            prompt: false,
            promptTitle: '',
            promptText: '',
            promptAction: () => { },
            cacheSize: 0,
            dataSize: 0,
            versionName: '',
            settings: {}
        };
    },
    methods: {
        refreshSize() {
            ApiRenderer.getDataSize('cache').then(s => this.cacheSize = s);
            ApiRenderer.getDataSize('app').then(s => this.dataSize = s);
        },
        toggleByName(name) {
            if (typeof this.settings[name] === 'boolean') {
                this.settings[name] = !this.settings[name];
            }
        },
        async clearSessionCache() {
            const { session } = remote.getCurrentWindow().webContents;
            new Promise(resolve => session.clearCache(resolve));
        },
        async clearCache() {
            await Promise.all([
                this.clearSessionCache(),
                ApiRenderer.clearAppData('cache')
            ]);
            this.refreshSize();
            this.$toast('成功清除缓存');
        },
        wipeAppData() {
            this.showPrompt({
                title: '提示',
                text: '这将清除所有应用数据，包括缓存以及账号登录状态，确定吗？',
                action: async () => {
                    ApiRenderer.updateCookie({});
                    window.onbeforeunload = null;
                    localStorage.clear();
                    await Promise.all([
                        this.clearSessionCache(),
                        ApiRenderer.clearAppData('app')
                    ]);
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
                qs.execSync(`xdg-open ${url}`);
            } catch (err) {
                try {
                    qs.execSync(`open ${url}`);
                } catch (err) {
                    this.showPrompt({
                        title: '提示',
                        text: `无法打开您的浏览器，请直接访问 ${url}`,
                        action: () => { }
                    });
                }
            }
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
    async created() {
        this.refreshSize();
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

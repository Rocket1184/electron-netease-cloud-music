<template>
    <div class="settings">
        <mu-sub-header>基本设置</mu-sub-header>
        <mu-list-item title="试听音质"
                      disableRipple />
        <div class="margin-block">
            <mu-radio label="高 (320 kbit/s)"
                      name="bitRate"
                      nativeValue="2"
                      v-model="settings.bitRate" />
            <br/>
            <mu-radio label="中 (160 kbit/s)"
                      name="bitRate"
                      nativeValue="1"
                      v-model="settings.bitRate" />
            <br/>
            <mu-radio label="低 (96 kbit/s)"
                      name="bitRate"
                      nativeValue="0"
                      v-model="settings.bitRate" />
        </div>
        <mu-list-item title="窗口边框"
                      disableRipple />
        <div class="margin-block">
            <mu-radio label="系统边框"
                      name="windowBorder"
                      nativeValue="1"
                      v-model="settings.windowBorder" />
            <br/>
            <mu-radio label="融合边框"
                      name="windowBorder"
                      nativeValue="0"
                      v-model="settings.windowBorder" />
        </div>
        <mu-list-item title="启动时自动开始播放"
                      @click="toggleByName('autoPlay')"
                      disableRipple>
            <mu-switch v-model="settings.autoPlay"
                       slot="right" />
        </mu-list-item>
        <mu-sub-header>高级设置</mu-sub-header>
        <mu-list-item title="清除缓存"
                      @click="clearCache"
                      disableRipple/>
        <mu-list-item title="清除所有应用数据"
                      @click="wipeAppData"
                      disableRipple/>
        <mu-list-item title="启动开发者工具"
                      @click="launchDevTools"
                      disableRipple/>
        <mu-list-item title="重新载入窗口"
                      @click="reloadWindow"
                      disableRipple/>
        <mu-toast v-if="toast"
                  :message="toastMsg" />
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
import { remote } from 'electron';

export default {
    data() {
        return {
            toast: false,
            toastMsg: '',
            toastTimer: 0,
            prompt: false,
            promptTitle: '',
            promptText: '',
            promptAction: () => { },
            settings: {
                bitRate: '2',
                windowBorder: '0',
                autoPlay: false
            }
        };
    },
    methods: {
        toggleByName(name) {
            if (typeof this.settings[name] === 'boolean') {
                this.settings[name] = !this.settings[name];
            }
        },
        clearCache() {

        },
        wipeAppData() {
            this.showPrompt({
                title: '提示',
                text: '这将清除所有应用数据，包括缓存以及账号登录状态，确定吗？',
                action() { console.log('duang!!!'); }
            });
        },
        launchDevTools() {
            remote.getCurrentWindow().openDevTools();
        },
        reloadWindow() {
            remote.getCurrentWindow().reload();
        },
        showToast(msg, timeOut = 1500) {
            if (this.toast) clearTimeout(this.toastTimer);
            this.toastMsg = String(msg);
            this.toast = true;
            this.toastTimer = setTimeout(() => this.toast = false, timeOut);
        },
        showPrompt(cfg) {
            this.prompt = true;
            this.promptTitle = cfg.title;
            this.promptText = cfg.text;
            this.promptAction = () => {
                cfg.action();
                this.prompt = false;
            };
        }
    },
    watch: {
        settings: {
            deep: true,
            handler: function () {
                this.showToast('设置已保存');
            }
        }
    }
};
</script>

<style lang="less">
.settings {
    width: 600px;
    margin-left: calc(~"50% - 300px");
    margin-bottom: 200px;
    .margin-block {
        margin: 4px 16px;
    }
}
</style>

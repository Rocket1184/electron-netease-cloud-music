<template>
    <div class="ncm-page">
        <div class="settings">
            <mu-list>
                <template v-for="group of Entries">
                    <mu-sub-header :key="group.name">{{ group.name }}</mu-sub-header>
                    <template v-for="item of group.items">
                        <component v-if="shouldShowOption(item)"
                            :key="item.title"
                            :is="Option[item.type]"
                            v-bind="item"></component>
                    </template>
                </template>
            </mu-list>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import Api from '@/api/ipc';
import { encm } from '@/util/globals';
import { setTheme } from '@/util/theme';
import { humanSize } from '@/util/formatter';
import { UPDATE_SETTINGS } from '@/store/mutation-types';
import { isDarwin, browserWindow, webContents } from '@/util/globals';

import OptionColor from './OptionColor.vue';
import OptionPlain from './OptionPlain.vue';
import OptionSelect from './OptionSelect.vue';
import OptionToggle from './OptionToggle.vue';
import { openColorPicker } from './open-color-picker';

import { Entries } from './entries';
import { Versions, RepoURL, IpcTag } from './constants';

const Option = {
    color: OptionColor,
    plain: OptionPlain,
    select: OptionSelect,
    toggle: OptionToggle
};

export default {
    data() {
        return {
            cacheSize: '',
            musicSize: '',
            dataSize: '',
            versionName: ''
        };
    },
    inject: [
        'darkMediaQuery'
    ],
    computed: {
        ...mapState(['settings'])
    },
    methods: {
        ...mapActions([
            'updateSettings',
            'resetSettings'
        ]),
        shouldShowOption(item) {
            if (!item.depends && !item.exclude) return true;
            if (Array.isArray(item.depends)) {
                for (const d of item.depends) {
                    if (!this.settings[d]) return false;
                }
            }
            if (Array.isArray(item.exclude)) {
                for (const e of item.exclude) {
                    if (this.Platforms[e]) return false;
                }
            }
            return true;
        },
        refreshSize() {
            webContents.sessionGetCacheSize().then(s => this.cacheSize = humanSize(s));
            Api.getDataSize('all').then(s => this.dataSize = humanSize(s.size));
            Api.getDataSize('music').then(s => this.musicSize = humanSize(s.size));
        },
        initData() {
            this.refreshSize();
            Api.getVersionName().then(v => this.versionName = v);
        },
        setByName(name, val) {
            if (this.settings[name] === val) return;
            return this.updateSettings({ [name]: val });
        },
        setColorByName(name) {
            openColorPicker().then(color => {
                this.setByName(name, color);
            }).catch(() => { /* noop */ });
        },
        clearCache(type) {
            switch (type) {
                case 'chrome':
                    return webContents.sessionClearCache();
                case 'music':
                    return Api.clearCache('music');
            }
        },
        promptClearCache(type) {
            let name;
            switch (type) {
                case 'chrome': name = '浏览器'; break;
                case 'music': name = '歌曲'; break;
            }
            this.$confirm(`${name}缓存将被清除，确定吗？`, {
                title: '清除缓存',
            }).then(({ result }) => {
                if (!result) throw 0;
                return this.clearCache(type);
            }).then(() => {
                this.$toast.message(`${name}缓存清除完成`);
                this.refreshSize();
            }).catch(() => { /* noop */ });
        },
        promptClearBrowserCache() {
            this.promptClearCache('chrome');
        },
        promptClearMusicCache() {
            this.promptClearCache('music');
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
                        webContents.sessionClearStorage(),
                        this.resetSettings(),
                        this.clearCache('music'),
                        this.clearCache('chrome'),
                    ]).then(() => this.recreateWindow());
                }
            });
        },
        launchDevTools() {
            webContents.openDevTools();
        },
        reloadPage() {
            browserWindow.reload();
        },
        recreateWindow() {
            encm.send(IpcTag, 'recreateWindow');
        },
        showVersions() {
            this.$alert(h => h('pre', { class: 'mono-font' }, Versions), '版本号');
        },
        openBrowser(url) {
            encm.invoke('openExternal', url).catch(() => {
                this.$alert(`无法打开您的浏览器，请直接访问 ${url}`, '提示');
            });
        },
        openRepoInBrowser() {
            this.openBrowser(RepoURL);
        },
        subscribeMutation() {
            return this.$store.subscribe(({ type, payload }, state) => {
                if (type !== UPDATE_SETTINGS) return;
                for (const [key, val] of Object.entries(payload)) {
                    switch (key) {
                        case 'themePrimaryColor':
                        case 'themeSecondaryColor':
                        case 'themeVariety':
                            const variety = state.settings.themeVariety === 'auto'
                                ? (this.darkMediaQuery.matches ? 'dark' : 'light')
                                : state.settings.themeVariety;
                            setTheme({
                                primary: state.settings.themePrimaryColor,
                                secondary: state.settings.themeSecondaryColor
                            }, variety);
                            break;
                        case 'windowBorder':
                            this.$nextTick(() => this.recreateWindow());
                            break;
                        case 'windowZoom':
                            webContents.setZoomFactor(val || 1);
                            break;
                        case 'showTrayIcon':
                            if (val === false && state.settings.exitOnWindowClose === false) {
                                this.setByName('exitOnWindowClose', true);
                            }
                        // eslint-disable-nextline no-fallthrough
                        case 'exitOnWindowClose':
                            encm.send(IpcTag, key, val);
                            break;
                        case 'bitRate':
                            if (val === 'ex') {
                                this.$toast.message('实际播放码率取决于歌曲最高码率和帐号最高可播放码率');
                            }
                            break;
                        case 'bitRateDownload':
                            if (val === 'ex') {
                                this.$toast.message('实际下载码率取决于歌曲最高码率和帐号最高可播放码率');
                            }
                            break;
                    }
                }
            });
        }
    },
    created() {
        this.initData();
        this.Option = Option;
        this.Entries = Entries;
        this.Platforms = { isDarwin };
        this.unsub = this.subscribeMutation();
    },
    beforeDestroy() {
        if (typeof this.unsub === 'function') {
            this.unsub();
        }
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

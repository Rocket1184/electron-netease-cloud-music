<template>
    <div>
        <audio id="playerbar-audio"
            :src="ui.audioSrc"></audio>
        <AppNav></AppNav>
        <div class="router-view">
            <keep-alive :include="/^page-\w+$/">
                <router-view></router-view>
            </keep-alive>
        </div>
        <PlayerBar></PlayerBar>
        <CollectPopup></CollectPopup>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import AppNav from '@/components/AppNav/AppNav.vue';
import PlayerBar from '@/components/PlayerBar/PlayerBar.vue';
import CollectPopup from '@/components/CollectPopup.vue';

export default {
    components: {
        AppNav,
        PlayerBar,
        CollectPopup
    },
    methods: {
        ...mapActions([
            'playAudio',
            'restoreUserInfo',
            'restoreSettings',
            'storePlaylist',
            'restorePlaylist'
        ])
    },
    computed: {
        ...mapState(['ui', 'settings'])
    },
    beforeCreate() {
        // if return value of this handler is something other than `undefined`,
        // 'unload' would be prevented.
        window.onbeforeunload = () => {
            this.storePlaylist();
        };
    },
    created() {
        this.restoreSettings().then(() => {
            if (this.settings.autoPlay) {
                this.playAudio();
            }
        });
        this.restoreUserInfo();
        this.restorePlaylist();
    }
};
</script>

<style lang="less">
*::-webkit-scrollbar {
    width: 10px;
}

*::-webkit-scrollbar-thumb {
    background-color: darkgrey;
}

*::-webkit-scrollbar-thumb:hover {
    background-color: grey;
}

body {
    font-family: Roboto, 'Noto Sans', 'Segoe UI', 'Noto Sans CJK SC', 'Source Han Sans CN', 'WenQuanYi Micro Hei',
        'WenQuanYi Zen Hei', 'Droid Sans Fallback', 'Microsoft Yahei', sans-serif;
}

.mono-font {
    font-family: 'Roboto Mono', 'Noto Sans Mono', 'Droid Sans Mono', 'Ubuntu Mono', 'Consolas', 'DejaVu Sans Mono',
        'Lucida Console', Roboto, 'Noto Sans', 'Segoe UI', 'Noto Sans CJK SC', 'Source Han Sans CN', 'Microsoft Yahei',
        sans-serif;
}

.router-view {
    height: calc(100vh - 128px);
    overflow: auto;
}

@font-face {
    font-family: 'Material Icons';
    font-style: normal;
    font-weight: 400;
    src: url('~assets/font/material-icons.woff2') format('woff2');
}

.material-icons {
    font-family: 'Material Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
}
</style>

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

import AppNav from '@/components/appNav.vue';
import PlayerBar from '@/components/playerBar.vue';
import CollectPopup from '@/components/collectPopup.vue';

export default {
    components: {
        AppNav,
        PlayerBar,
        CollectPopup
    },
    methods: {
        ...mapActions([
            'restoreUserInfo',
            'restoreSettings',
            'storePlaylist',
            'restorePlaylist'
        ])
    },
    computed: {
        ...mapState(['ui'])
    },
    beforeCreate() {
        // if return value of this handler is something other than `undefined`,
        // 'unload' would be prevented.
        window.onbeforeunload = () => {
            this.storePlaylist();
        };
    },
    created() {
        this.restoreSettings();
        this.restoreUserInfo();
        this.restorePlaylist();
    }
};
</script>

<style lang="less">
body {
    font-family: Roboto, 'Noto Sans', 'Segoe UI', 'Noto Sans CJK SC', 'Source Han Sans CN', 'Microsoft Yahei', sans-serif;
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

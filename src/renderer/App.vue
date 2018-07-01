<template>
    <div id="app">
        <audio id="playerbar-audio"
            :src="ui.audioSrc"></audio>
        <AppNav></AppNav>
        <div class="router-view">
            <keep-alive :include="/^page-\w+$/">
                <router-view></router-view>
            </keep-alive>
        </div>
        <PlayerBar></PlayerBar>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import AppNav from '@/components/appNav.vue';
import PlayerBar from '@/components/playerBar.vue';

export default {
    components: {
        AppNav,
        PlayerBar
    },
    methods: {
        ...mapActions([
            'restoreUserInfo',
            'restoreSettings'
        ])
    },
    computed: {
        ...mapState([
            'ui'
        ])
    },
    created() {
        this.restoreSettings();
        this.restoreUserInfo();
    }
};
</script>

<style>
html,
body,
#app {
    height: 100%;
    overflow: hidden;
}

.router-view {
    height: calc(100% - 128px);
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

<template>
    <div id="app">
        <audio id="playerbar-audio"
            :src="playing.url"></audio>
        <appNav></appNav>
        <div class="router-view">
            <keep-alive>
                <router-view></router-view>
            </keep-alive>
        </div>
        <playerBar></playerBar>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import appNav from './components/appNav';
import playerBar from './components/playerBar';
import ApiRenderer from './util/apiRenderer';
import * as types from './vuex/mutation-types';

export default {
    components: {
        appNav,
        playerBar
    },
    methods: {
        ...mapActions([
            'restoreUserInfo'
        ])
    },
    computed: {
        ...mapGetters([
            'playing',
        ]),
    },
    async beforeCreate() {
        const st = await ApiRenderer.getCurrentSettings();
        this.$store.commit(types.UPDATE_SETTINGS, st);
    },
    created() {
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

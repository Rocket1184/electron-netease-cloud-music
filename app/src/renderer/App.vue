<template>
    <div id="app">
        <AppNav/>
        <div class="router-view">
            <keep-alive>
                <router-view/>
            </keep-alive>
        </div>
        <PlayerBar/>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import store from './vuex/store';
import AppNav from './components/appnav';
import PlayerBar from './components/playerbar';
import ApiRenderer from './util/apirenderer';
import * as types from './vuex/mutation-types';

export default {
    store,
    components: {
        AppNav,
        PlayerBar
    },
    computed: {
        ...mapGetters([
            'loginValid'
        ])
    },
    methods: {
        async checkLogin() {
            const sugg = await ApiRenderer.login();
            return sugg.code === 200;
        }
    },
    watch: {
        async loginValid(val) {
            if (val === true) {
                const { id } = this.$store.state.user.info;
                const resp = await ApiRenderer.getUserPlaylist(id);
                this.$store.commit(types.UPDATE_USER_INFO, {
                    info: resp.playlist[0].creator
                });
                this.$store.commit(types.SET_USER_PLAYLIST, {
                    playlist: resp.playlist
                });
            }
        }
    },
    async beforeCreate() {
        const st = await ApiRenderer.getCurrentSettings();
        this.$store.commit(types.UPDATE_SETTINGS, st);
    },
    async created() {
        const oldUid = localStorage.getItem('uid');
        const oldUser = localStorage.getItem('user');
        const oldCookie = localStorage.getItem('cookie');

        if (oldUid && oldUser && oldCookie) {
            const cookieObj = JSON.parse(oldCookie);
            ApiRenderer.updateCookie(cookieObj);
            const userObj = JSON.parse(oldUser);
            this.$store.commit(types.UPDATE_USER_INFO, {
                info: userObj
            });
            if (await this.checkLogin()) {
                this.$store.commit(types.SET_LOGIN_VALID);
            } else {
                this.$store.commit(types.SET_LOGIN_VALID, false);
                ApiRenderer.updateCookie({});
            }
        }
    }
};
</script>

<style>
* {
    margin: 0;
    padding: 0;
}

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
    src: url('../../assets/font/material-icons.woff2') format('woff2');
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

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
    methods: {
        async checkLogin() {
            const sugg = await ApiRenderer.getDailySuggestions();
            return sugg.code !== 301;
        },
        async getPlaylist(uid) {
            return await ApiRenderer.getUserPlaylist(uid);
        }
    },
    async created() {
        const oldUid = localStorage.getItem('uid');
        const oldUser = localStorage.getItem('user');
        const oldCookie = localStorage.getItem('cookie');

        if (oldUid && oldUser && oldCookie) {
            try {
                const uid = +oldUid;
                const cookieObj = JSON.parse(oldCookie);
                ApiRenderer.updateCookie(cookieObj);
                const userObj = JSON.parse(oldUser);
                this.$store.commit({
                    type: types.SET_LOGIN_VALID
                });
                this.$store.commit({
                    type: types.UPDATE_USER_INFO,
                    ...userObj
                });
                if (await this.checkLogin()) {
                    let info = await this.getPlaylist(uid);
                    this.$store.commit({
                        type: types.UPDATE_USER_INFO,
                        playlist: info.playlist,
                        profile: info.playlist[0].creator
                    });
                } else {
                    this.$store.commit({
                        type: types.SET_LOGIN_VALID,
                        valid: false
                    });
                }
            } catch (err) { console.error(err); }
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

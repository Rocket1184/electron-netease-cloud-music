<template>
    <div id="app">
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
import { mapGetters } from 'vuex';

import store from './vuex/store';
import appNav from './components/appNav';
import playerBar from './components/playerBar';
import ApiRenderer from './util/apiRenderer';
import * as types from './vuex/mutation-types';

export default {
    store,
    components: {
        appNav,
        playerBar
    },
    computed: {
        ...mapGetters([
            'loginValid'
        ])
    },
    methods: {
        async checkLogin() {
            const resp = await ApiRenderer.refreshLogin();
            return resp.code === 200;
        }
    },
    watch: {
        loginValid(val) {
            if (val === true) {
                // it needs concurrency here
                // but how to do it with async ??? maybe cannot
                const { id } = this.$store.state.user.info;
                ApiRenderer.getCookie()
                    .then(cookie => localStorage.setItem('cookie', JSON.stringify(cookie)));
                ApiRenderer.getUserPlaylist(id)
                    .then(resp => {
                        this.$store.commit(types.UPDATE_USER_INFO, {
                            info: resp.playlist[0].creator
                        });
                        this.$store.commit(types.SET_USER_PLAYLIST, {
                            playlist: resp.playlist
                        });
                        if (~resp.playlist[0].name.indexOf('喜欢的音乐')) {
                            return resp.playlist[0].id;
                        }
                    }).then(likedListId => {
                        ApiRenderer.getListDetail(likedListId)
                            .then(list => {
                                this.$store.commit(types.UPDATE_USER_PLAYLIST, list.playlist);
                            });
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

<template>
    <div id="app">
        <appNav/>
        <div class="router-view">
            <router-view/>
        </div>
        <playerBar/>
    </div>
</template>

<script>
import store from './vuex/store';
import appNav from './components/appnav';
import playerBar from './components/playerbar';
import ApiRenderer from './util/apirenderer';
import * as types from './vuex/mutation-types';

export default {
    store,
    components: {
        appNav,
        playerBar
    },
    async created() {
        const oldUid = localStorage.getItem('uid');
        const oldCookie = localStorage.getItem('cookie');

        if (oldCookie) {
            try {
                const uid = +oldUid;
                const cookieObj = JSON.parse(oldCookie);
                ApiRenderer.updateCookie(cookieObj);

                const info = await ApiRenderer.getUserInfo(uid);
                this.$store.commit({
                    type: types.UPDATE_USER_INFO,
                    profile: info.playlist[0].creator
                });

                const sugg = await ApiRenderer.getDailySuggestions();
                if (sugg.code === 200) {
                    this.$store.commit({
                        type: types.SET_LOGIN_VALID
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

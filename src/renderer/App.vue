<template>
    <div>
        <audio id="playerbar-audio"
            :src="ui.audioSrc"></audio>
        <AppNav></AppNav>
        <div class="router-view">
            <transition :name="transitionName">
                <keep-alive :include="/^page-\w+$/">
                    <router-view></router-view>
                </keep-alive>
            </transition>
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
    name: 'app',
    components: {
        AppNav,
        PlayerBar,
        CollectPopup
    },
    data() {
        return {
            transitionName: 'fade-down'
        };
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
        // route stack is empty when created in 'abstract' mode
        this.$router.push({ name: 'index' });
        this.$router.beforeEach((to, from, next) => {
            const { index, stack } = this.$router.history;
            const lastRoute = stack[index - 1 >= 0 ? index - 1 : 0];
            if (to.name === 'player') {
                this.transitionName = 'player-in';
            } else if (from.name === 'player') {
                this.transitionName = 'player-out';
            } else if (to.name === 'index' || to.path === lastRoute.path) {
                this.transitionName = 'fade-down';
            } else {
                this.transitionName = 'fade-up';
            }
            next();
        });
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
.router-view {
    height: calc(100vh - 128px);
    overflow: hidden;
    position: relative;
    margin-top: 64px;
    .ncm-page {
        width: 100%;
        height: 100%;
        overflow: auto;
        position: absolute;
    }
}
</style>

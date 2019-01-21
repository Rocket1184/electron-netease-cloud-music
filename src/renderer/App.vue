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
.router-view {
    height: calc(100vh - 128px);
    overflow: hidden;
    position: relative;
    .ncm-page {
        width: 100%;
        height: 100%;
        overflow: auto;
        position: absolute;
    }
}
</style>

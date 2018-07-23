<template>
    <mu-dialog title="收藏到歌单"
        scrollable
        :open="ui.collectPopupShow"
        @close="handleClose">
        <userPlaylists @rowClick="handleCollect"></userPlaylists>
        <mu-button slot="actions"
            flat
            @click="handleClose">关闭</mu-button>
    </mu-dialog>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import ApiRenderer from '@/util/apiRenderer';
import userPlaylists from './userPlaylists.vue';

export default {
    components: {
        userPlaylists
    },
    computed: {
        ...mapState(['ui']),
        ...mapGetters(['loginValid'])
    },
    methods: {
        ...mapActions(['toggleCollectPopup', 'refreshUserPlaylist']),
        handleClose() {
            this.toggleCollectPopup();
            this.$emit('close');
        },
        async handleCollect(list) {
            if (!this.loginValid) {
                this.$toast.message('讲道理不应该这样的呀  (✘﹏✘ა)');
                return;
            }
            const resp = await ApiRenderer.collectTrack(list.id, ...this.ui.collectTrackIds);
            if (resp.code === 200) {
                this.$toast.message('成功添加到歌单     (๑•̀ㅂ•́)و✧');
                // same to above
                setTimeout(() => this.refreshUserPlaylist(list.id), 200);
            } else if (resp.code === 502) {
                this.$toast.message('歌曲已存在        ¯\\_(ツ)_/¯');
            } else {
                this.$toast.message(`失败了 ∑(っ °Д °;)っ 错误代码 ${resp.code}`);
            }
        }
    }
};
</script>

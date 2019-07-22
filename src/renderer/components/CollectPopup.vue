<template>
    <mu-dialog title="收藏到歌单"
        scrollable
        width="400"
        :open="ui.collectPopupShow"
        @close="handleClose">
        <mu-list class="collect-popup-list">
            <AvatarListItem v-for="(list, index) in listToShow"
                :key="index"
                :img="list.coverImgUrl"
                :title="list.name"
                :subTitle="`共 ${list.trackCount} 首`"
                @click="handleCollect(list, index)">
            </AvatarListItem>
        </mu-list>
        <template #actions>
            <mu-button flat
                @click="handleClose">关闭</mu-button>
        </template>
    </mu-dialog>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import AvatarListItem from '@/components/AvatarListItem.vue';

export default {
    computed: {
        ...mapState(['ui', 'user']),
        listToShow() {
            return this.user.playlist.filter(l => l.creator.id === this.user.info.id);
        }
    },
    methods: {
        ...mapActions([
            'collectTrack',
            'toggleCollectPopup',
            'updateFavoriteTrackIds',
            'updatePlaylistDetailById'
        ]),
        handleClose() {
            this.toggleCollectPopup();
            this.$emit('close');
        },
        async handleCollect(playlist) {
            if (!this.user.loginValid) {
                this.$toast.message('讲道理不应该这样的呀  (✘﹏✘ა)');
                return;
            }
            try {
                const pid = playlist.id;
                await this.collectTrack({ pid, tracks: this.ui.collectTrackIds });
                this.$toast.message('成功添加到歌单     (๑•̀ㅂ•́)و✧');
                if (this.user.playlist[0].id === pid) {
                    this.updateFavoriteTrackIds();
                } else {
                    this.updatePlaylistDetailById(pid);
                }
            } catch (resp) {
                if (resp.code === 502) {
                    this.$toast.message('歌曲已存在        ¯\\_(ツ)_/¯');
                } else {
                    this.$toast.message(`失败了 ∑(っ °Д °;)っ 错误代码 ${resp.code}`);
                }
            }
        }
    },
    components: {
        AvatarListItem
    }
};
</script>

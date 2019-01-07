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
        <mu-button slot="actions"
            flat
            @click="handleClose">关闭</mu-button>
    </mu-dialog>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import AvatarListItem from './AvatarListItem.vue';
import ApiRenderer from '@/util/apiRenderer';

export default {
    computed: {
        ...mapState(['ui', 'user']),
        listToShow() {
            return this.user.playlist.filter(l => l.creator.id === this.user.info.id);
        }
    },
    methods: {
        ...mapActions(['toggleCollectPopup', 'updatePlaylistDetail']),
        handleClose() {
            this.toggleCollectPopup();
            this.$emit('close');
        },
        async handleCollect(list) {
            if (!this.user.loginValid) {
                this.$toast.message('讲道理不应该这样的呀  (✘﹏✘ა)');
                return;
            }
            const resp = await ApiRenderer.collectTrack(list.id, ...this.ui.collectTrackIds);
            if (resp.code === 200) {
                this.$toast.message('成功添加到歌单     (๑•̀ㅂ•́)و✧');
                // same to above
                setTimeout(() => this.updatePlaylistDetail(list.id), 200);
            } else if (resp.code === 502) {
                this.$toast.message('歌曲已存在        ¯\\_(ツ)_/¯');
            } else {
                this.$toast.message(`失败了 ∑(っ °Д °;)っ 错误代码 ${resp.code}`);
            }
        }
    },
    components: {
        AvatarListItem
    }
};
</script>

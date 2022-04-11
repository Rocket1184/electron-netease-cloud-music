<template>
    <ListDetailLayout class="fav-playlist"
        :listLoading="user.playlist.length <= 0"
        :detailLoading="detailLoading"
        tipText="登录后查看收藏的歌单"
        :showTip="!user.loginValid">
        <template #list>
            <mu-list toggle-nested
                :nested-indent="false">
                <mu-list-item v-for="group in listGroups"
                    button
                    nested
                    :key="group.name"
                    :open="group.open"
                    @click="group.open = !group.open">
                    <mu-list-item-title>{{group.name}}</mu-list-item-title>
                    <mu-list-item-action>
                        <mu-icon class="toggle-icon"
                            size="24"
                            value="keyboard_arrow_down"></mu-icon>
                    </mu-list-item-action>
                    <template #nested>
                        <AvatarListItem v-for="(list, index) in group.lists"
                            :key="index"
                            @click="loadPlaylist(list.id)"
                            :img="list.coverImgUrl"
                            :title="list.name"
                            :subTitle="`共 ${list.trackCount} 首`"></AvatarListItem>
                    </template>
                </mu-list-item>
            </mu-list>
        </template>
        <PlaylistDetail v-if="playlist"
            :playlist="playlist"></PlaylistDetail>
    </ListDetailLayout>
</template>

<script>
import { getPlaylistDetail } from '@/api/typed';
import { SET_USER_PLAYLISTS } from '@/store/mutation-types';

import ListDetailLayout from '@/components/ListDetailLayout.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
import PlaylistDetail from '@/components/PlaylistDetail.vue';

export default {
    data() {
        return {
            /** @type {Models.PlayList} */
            playlist: null,
            detailLoading: false
        };
    },
    computed: {
        /** @returns {import('@/store/modules/user').State} */
        user() { return this.$store.state.user; },
        /** @returns {{ name: string, open: boolean, lists: Models.PlayList[] }[]} */
        listGroups() {
            if (!this.user.loginValid) return [];
            return [
                {
                    name: '创建的歌单',
                    open: true,
                    lists: this.user.playlist.filter(e => e.creator.id == this.user.info.id)
                },
                {
                    name: '收藏的歌单',
                    open: true,
                    lists: this.user.playlist.filter(e => e.creator.id != this.user.info.id)
                }
            ];
        }
    },
    methods: {
        async loadPlaylist(id) {
            this.detailLoading = true;
            this.playlist = await getPlaylistDetail(id);
            this.detailLoading = false;
        },
        async fetchData() {
            this.loadPlaylist(this.user.playlist[0].id);
        }
    },
    created() {
        if (this.user.loginValid && this.user.playlist.length > 0) {
            this.fetchData();
        } else {
            this.unsub = this.$store.subscribe(({ type, payload }) => {
                if (type === SET_USER_PLAYLISTS && payload.length > 0) {
                    this.fetchData();
                }
            });
        }
    },
    beforeDestroy() {
        if (this.unsub) {
            this.unsub();
        }
    },
    components: {
        ListDetailLayout,
        AvatarListItem,
        PlaylistDetail
    }
};
</script>

<style lang="less">
.fav-playlist {
    .mu-load-more {
        overflow: auto;
    }
}
</style>

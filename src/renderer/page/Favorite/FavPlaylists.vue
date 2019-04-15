<template>
    <ListDetailLayout class="fav-playlist"
        :listLoading="user.playlist.length <= 0"
        :detailLoading="detailLoading"
        tipText="登录后查看收藏的歌单"
        :showTip="!user.loginValid">
        <template #list>
            <mu-load-more @refresh="handleListRefresh"
                :refreshing="listRefreshing">
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
                                @click="handleClick(list.id)"
                                :img="list.coverImgUrl"
                                :title="list.name"
                                :subTitle="`共 ${list.trackCount} 首`"></AvatarListItem>
                        </template>
                    </mu-list-item>
                </mu-list>
            </mu-load-more>
        </template>
        <PlaylistDetail v-if="playlist"
            :playlist="playlist"
            @detail-scroll="scrollContent"></PlaylistDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import { SET_USER_PLAYLISTS } from '@/store/mutation-types';
import ListDetailLayout from '@/components/ListDetailLayout.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
import PlaylistDetail from '@/components/PlaylistDetail.vue';

export default {
    data() {
        return {
            playlistId: null,
            detailLoading: false,
            listRefreshing: false
        };
    },
    computed: {
        ...mapState(['user']),
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
        },
        playlist() {
            if (!this.user.loginValid) return null;
            if (!this.playlistId) return null;
            return this.user.playlist.find(p => p.id === this.playlistId);
        }
    },
    methods: {
        ...mapActions([
            'updateUserPlaylist',
            'updateUserPlaylistDetail'
        ]),
        async handleListRefresh() {
            this.listRefreshing = true;
            await this.updateUserPlaylist();
            this.listRefreshing = false;
            this.loadPlaylist(this.playlistId);
        },
        async loadPlaylist(id) {
            this.detailLoading = true;
            await this.updateUserPlaylistDetail(id);
            this.playlistId = id;
            this.detailLoading = false;
        },
        handleClick(id) {
            if (this.playlistId === id) return;
            this.loadPlaylist(id);
        },
        /**
         * @param {number} top
         * @param {ScrollBehavior} behavior
         */
        scrollContent(top, behavior = 'smooth') {
            document.querySelector('.ld-detail').scrollTo({ top, behavior });
        },
    },
    mounted() {
        if (this.user.loginValid) {
            this.loadPlaylist(this.user.playlist[0].id);
        } else {
            this.$store.subscribe((mutation) => {
                if (mutation.type === SET_USER_PLAYLISTS) {
                    if (this.$route.name === 'favorite') {
                        this.loadPlaylist(this.user.playlist[0].id);
                    }
                }
            });
        }
    },
    components: {
        ListDetailLayout,
        AvatarListItem,
        PlaylistDetail
    }
};
</script>

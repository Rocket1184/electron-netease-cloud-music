<template>
    <ListDetailLayout class="fav-playlist"
        :loading="loading"
        tipText="登录后查看收藏的歌单"
        :showTip="!user.loginValid">
        <mu-load-more slot="list"
            @refresh="handleListRefresh"
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
                    <AvatarListItem v-for="(list, index) in group.lists"
                        slot="nested"
                        :key="index"
                        @click="handleClick(list.id)"
                        :img="list.coverImgUrl"
                        :title="list.name"
                        :subTitle="`共 ${list.trackCount} 首`"></AvatarListItem>
                </mu-list-item>
            </mu-list>
        </mu-load-more>
        <PlaylistDetail slot="detail"
            v-if="playlist"
            :playlist="playlist"></PlaylistDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import { SET_USER_PLAYLISTS } from '@/vuex/mutation-types';
import ListDetailLayout from '@/components/ListDetailLayout.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
import PlaylistDetail from '@/components/PlaylistDetail.vue';

export default {
    data() {
        return {
            playlistId: null,
            loading: false,
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
        ...mapActions(['updateUserPlaylists', 'updatePlaylistDetail']),
        async handleListRefresh() {
            this.listRefreshing = true;
            await this.updateUserPlaylists();
            this.listRefreshing = false;
            this.loadPlaylist(this.playlistId);
        },
        async loadPlaylist(id) {
            this.loading = true;
            await this.updatePlaylistDetail(id);
            this.playlistId = id;
            this.loading = false;
        },
        handleClick(id) {
            if (this.playlistId  === id) return;
            this.loadPlaylist(id);
        }
    },
    mounted() {
        if (!this.user.loginValid) {
            this.$store.subscribe((mutation) => {
                if (mutation.type === SET_USER_PLAYLISTS) {
                    if (this.$route.path.startsWith('/favorite')) {
                        this.loadPlaylist(this.user.playlist[0].id);
                    }
                }
            });
        } else {
            setTimeout(() => {
                this.loadPlaylist(this.user.playlist[0].id);
            }, 200);
        }
    },
    components: {
        ListDetailLayout,
        AvatarListItem,
        PlaylistDetail
    }
};
</script>

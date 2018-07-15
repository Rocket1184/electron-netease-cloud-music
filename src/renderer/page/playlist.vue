<template>
    <div class="myplaylist">
        <mu-paper class="aside">
            <mu-list v-if="loginValid">
                <mu-list-item v-for="group in listGroups"
                    :key="group.name"
                    :title="group.name"
                    toggleNested>
                    <PlaylistItem v-for="(list, index) in group.lists"
                        slot="nested"
                        :key="index"
                        :item="list"
                        @click="loadPlaylist(list.id)">
                    </PlaylistItem>
                </mu-list-item>
            </mu-list>
            <div v-else
                class="myplaylist-login-tip">
                <mu-icon value="nature_people"
                    color="grey"
                    :size="128"></mu-icon>
                <p>登录后查看创建/收藏的歌单</p>
            </div>
        </mu-paper>
        <div class="content">
            <template v-if="detail">
                <PlaylistHeader :detail="detail"></PlaylistHeader>
                <mu-sub-header>曲目列表</mu-sub-header>
                <PlayAll :tracks="tracks"></PlayAll>
            </template>
            <TrackList v-if="loginValid"
                :tracks="tracksToShow"
                :indexOffset="tracksOffset"></TrackList>
            <div class="pagination"
                v-if="tracks.length > 50">
                <mu-pagination :total="tracks.length"
                    :current="currentPage"
                    :pageSize="pageSize"
                    @pageChange="handlePageChange">
                </mu-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import PlayAll from '@/components/playAll.vue';
import TrackList from '@/components/trackList.vue';
import PlaylistItem from '@/components/myPlaylistItem.vue';
import PlaylistHeader from '@/components/playlistHeader.vue';
import { SET_USER_PLAYLISTS } from '@/vuex/mutation-types';

export default {
    name: 'page-playlist',
    data() {
        return {
            detail: null,
            listGroups: [],
            tracks: [],
            currentPage: 1,
            pageSize: 50
        };
    },
    computed: {
        ...mapGetters(['user', 'loginValid']),
        tracksOffset() {
            return (this.currentPage - 1) * this.pageSize;
        },
        tracksToShow() {
            return this.tracks.slice(this.tracksOffset, this.tracksOffset + this.pageSize);
        }
    },
    methods: {
        ...mapActions(['refreshUserPlaylist']),
        updateListGroups() {
            this.listGroups = [
                {
                    name: '创建的歌单',
                    lists: this.user.playlist.filter(e => e.creator.id == this.user.id)
                },
                {
                    name: '收藏的歌单',
                    lists: this.user.playlist.filter(e => e.creator.id != this.user.id)
                }
            ];
        },
        async loadPlaylist(id) {
            this.detail = null;
            this.tracks = [];
            await this.refreshUserPlaylist({ id });
            const target = this.user.playlist.find(p => p.id === id);
            if (target) {
                this.detail = target;
                this.tracks = target.tracks;
            }
        },
        handlePageChange(newIndex) {
            this.currentPage = newIndex;
        }
    },
    created() {
        if (this.loginValid) {
            this.updateListGroups();
            this.loadPlaylist(this.user.playlist[0].id);
        } else {
            this.$store.subscribe((mutation) => {
                if (mutation.type === SET_USER_PLAYLISTS) {
                    this.updateListGroups();
                    this.loadPlaylist(this.user.playlist[0].id);
                }
            });
        }
    },
    components: {
        PlayAll,
        TrackList,
        PlaylistItem,
        PlaylistHeader
    }
};
</script>

<style lang="less">
.myplaylist {
    display: flex;
    flex-direction: row;
    height: 100%;
    .aside {
        flex: 1;
        z-index: 1;
        height: 100%;
        overflow: auto;
        .myplaylist-login-tip {
            height: 100%;
            color: grey;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
    }
    .content {
        flex: 3;
        height: 100%;
        overflow: auto;
        .pagination {
            width: 100%;
            padding: 16px;
        }
    }
}
</style>

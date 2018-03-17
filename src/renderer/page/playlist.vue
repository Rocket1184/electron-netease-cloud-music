<template>
    <div class="myplaylist">
        <mu-paper class="aside">
            <mu-list>
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
        </mu-paper>
        <div class="content">
            <template v-if="detail">
                <PlaylistHeader :detail="detail"></PlaylistHeader>
                <mu-sub-header>曲目列表</mu-sub-header>
                <PlayAll :tracks="tracks"></PlayAll>
            </template>
            <TrackList :tracks="tracksToShow"
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

export default {
    name: 'page-playlist',
    data() {
        return {
            detail: {},
            tracks: [],
            currentPage: 1,
            pageSize: 50
        };
    },
    computed: {
        ...mapActions([
            'refreshUserPlaylist'
        ]),
        ...mapGetters([
            'user'
        ]),
        listGroups() {
            return [
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
        tracksOffset() {
            return (this.currentPage - 1) * this.pageSize;
        },
        tracksToShow() {
            return this.tracks.slice(this.tracksOffset, this.tracksOffset + this.pageSize);
        }
    },
    methods: {
        async loadPlaylist(id) {
            this.detail = null;
            this.tracks = [];
            await this.$store.dispatch('refreshUserPlaylist', id);
            // why don't use
            // `this.refreshUserPlaylist(id);`
            // here? If so, vuex action `refreshUserPlaylist` would receive
            // wrong params. Maybe a bug?
            const target = this.user.playlist.filter(p => p.id === id).pop();
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
        this.loadPlaylist(this.listGroups[0].lists[0].id);
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

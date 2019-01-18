<template>
    <div class="search">
        <div class="search-tab"
            v-elevation="4">
            <mu-tabs inverse
                :value="searchType"
                @change="handleTabChange">
                <mu-tab value="song">单曲</mu-tab>
                <mu-tab value="artist">歌手</mu-tab>
                <mu-tab value="album">专辑</mu-tab>
                <mu-tab value="playlist">歌单</mu-tab>
                <mu-tab value="video">视频</mu-tab>
                <mu-tab value="user">用户</mu-tab>
            </mu-tabs>
        </div>
        <div class="search-content"
            ref="searchContent">
            <CenteredTip v-if="searchType === 'user'"></CenteredTip>
            <CenteredTip v-else-if="!haveSearched"
                icon="search"
                tip="右上角搜索框内输入，回车搜索！"></CenteredTip>
            <CenteredLoading v-else-if="isPosting"></CenteredLoading>
            <CenteredTip v-else-if="!haveValidResults"
                icon="inbox"
                tip="哎呀～什么都没找到 ..."></CenteredTip>
            <CenteredTip v-else-if="searchError"
                icon="error_outline"
                :tip="`出错了 ... 错误代码 ${this.searchErrorCode}`"></CenteredTip>
            <TrackList v-else-if="searchType === 'song'"
                :tracks="items"
                :source="{ name: 'search', id: $route.query.keyword }"
                :indexOffset="searchOffset"></TrackList>
            <ArtistList v-else-if="searchType === 'artist'"
                :list="items"></ArtistList>
            <AlbumList v-else-if="searchType === 'album'"
                showArtist
                :list="items"></AlbumList>
            <PlaylistList v-else-if="searchType === 'playlist'"
                :list="items"></PlaylistList>
            <VideoList v-else-if="searchType === 'video'"
                showBadge
                :videos="items"></VideoList>
            <CenteredTip v-else
                icon="bug_report"
                tip="为什么会这样呢 ..."></CenteredTip>
            <div class="pagination"
                v-if="totalItems > 20">
                <mu-pagination :total="totalItems"
                    :current="currentPage"
                    :page-size="pageSize"
                    @change="handlePageChange">
                </mu-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import Api from '@/util/api';
import { Track, Video } from '@/util/models';

import TrackList from '@/components/TrackList.vue';
import CenteredTip from '@/components/CenteredTip.vue';
import CenteredLoading from '@/components/CenteredLoading.vue';
import VideoList from '@/components/VideoList.vue';
import AlbumList from '@/components/AlbumList.vue';
import ArtistList from '@/components/ArtistList.vue';
import PlaylistList from '@/components/PlaylistList.vue';

export default {
    name: 'page-search',
    data() {
        return {
            haveSearched: false,
            haveValidResults: false,
            isPosting: false,
            searchError: false,
            searchErrorCode: null,
            searchType: 'song',
            currentPage: 1,
            defaultPage: 1,
            pageSize: 20,
            items: [],
            totalItems: 0
        };
    },
    computed: {
        searchOffset() {
            return (this.currentPage - 1) * this.pageSize;
        }
    },
    methods: {
        handleTabChange(val) {
            this.searchType = val;
            this.currentPage = this.defaultPage;
            this.totalItems = 0;
            this.updateQueryString();
        },
        handlePageChange(newIndex) {
            this.$refs.searchContent.scrollTo({ top: 0 });
            this.currentPage = newIndex;
            this.updateQueryString();
        },
        updateQueryString() {
            this.$router.push({
                name: 'search',
                query: {
                    keyword: this.$route.query.keyword,
                    type: this.searchType,
                    page: this.currentPage
                }
            });
        },
        async handleSearch() {
            const { keyword, type = this.searchType, page = this.defaultPage } = this.$route.query;
            if (!keyword) return;
            if (!this.haveSearched) this.haveSearched = true;
            this.searchType = type;
            this.currentPage = Number(page);
            this.isPosting = true;
            const resp = await Api.search(keyword, type, this.pageSize, this.searchOffset);
            this.isPosting = false;
            if (resp.code === 200) {
                this.searchError = false;
                this.searchErrorCode = -1;
                switch (this.searchType) {
                    case 'song':
                        this.totalItems = resp.result.songCount;
                        this.items = resp.result.songs.map(i => new Track(i)) || [];
                        break;
                    case 'artist':
                        this.totalItems = resp.result.artistCount;
                        this.items = resp.result.artists || [];
                        break;
                    case 'album':
                        this.totalItems = resp.result.albumCount;
                        this.items = resp.result.albums || [];
                        break;
                    case 'playlist':
                        this.totalItems = resp.result.playlistCount;
                        this.items = resp.result.playlists || [];
                        break;
                    case 'video':
                        this.totalItems = resp.result.videoCount;
                        this.items = resp.result.videos.map(v => new Video(v)) || [];
                        break;
                    default:
                        break;
                }
                this.haveValidResults = Boolean(this.items.length);
            } else {
                this.searchError = true;
                this.searchErrorCode = resp.code;
            }
        }
    },
    beforeRouteEnter(to, from, next) {
        // this component would be created in the new route
        next(vm => {
            vm.handleSearch();
        });
    },
    beforeRouteUpdate(to, from, next) {
        // this component is reused in the new route
        next();
        this.handleSearch();
    },
    components: {
        TrackList,
        CenteredTip,
        CenteredLoading,
        VideoList,
        AlbumList,
        ArtistList,
        PlaylistList
    }
};
</script>

<style lang="less">
.search {
    height: 100%;
    display: flex;
    flex-direction: column;
    .search-content {
        height: calc(~'100% - 48px');
        overflow: auto;
    }
    .pagination {
        width: 100%;
        padding: 16px;
    }
}
</style>

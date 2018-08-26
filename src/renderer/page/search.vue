<template>
    <div class="search">
        <div v-elevation="4">
            <mu-tabs full-width
                inverse
                :value="searchType"
                @change="handleTabChange">
                <mu-tab value="song">单曲</mu-tab>
                <mu-tab value="artist">歌手</mu-tab>
                <mu-tab value="album">专辑</mu-tab>
                <mu-tab value="playlist">歌单</mu-tab>
                <mu-tab value="mv">MV</mu-tab>
                <mu-tab value="user">用户</mu-tab>
            </mu-tabs>
        </div>
        <div v-if="!haveSearched"
            class="search-tip">
            <mu-icon value="search"
                color="grey"
                :size="128"></mu-icon>
            <p>右上角搜索框内输入，回车搜索！</p>
        </div>
        <div v-else-if="isPosting"
            class="search-tip">
            <mu-circular-progress color="secondary"
                :size="60"
                :stroke-width="5"></mu-circular-progress>
        </div>
        <div v-else-if="!haveValidResults"
            class="search-tip">
            <mu-icon value="inbox"
                color="grey"
                :size="128"></mu-icon>
            <p>哎呀～什么都没找到 ...</p>
        </div>
        <div v-else-if="searchError"
            class="search-tip">
            <mu-icon value="error_outline"
                color="grey"
                :size="128"></mu-icon>
            <p>哎呀～出错了 ... 错误代码 {{this.searchErrorCode}}</p>
        </div>
        <div v-else-if="searchType === 'song'">
            <TrackList :tracks="items"
                :indexOffset="searchOffset"></TrackList>
        </div>
        <div v-else-if="searchType === 'artist'">
            <ArtistList :list="items"></ArtistList>
        </div>
        <div v-else-if="searchType === 'album'">
            <AlbumList :list="items"></AlbumList>
        </div>
        <div v-else-if="searchType === 'playlist'">
            <PlaylistList :list="items"></PlaylistList>
        </div>
        <div v-else-if="searchType === 'mv'">
            <UnderConstructionTip></UnderConstructionTip>
        </div>
        <div v-else-if="searchType === 'user'">
            <UnderConstructionTip></UnderConstructionTip>
        </div>
        <div v-else
            class="search-tip">
            <mu-icon value="bug_report"
                color="grey"
                :size="128"></mu-icon>
            <p>你是怎么来到这儿的？来报个 bug 吧少年！</p>
        </div>
        <div class="pagination"
            v-if="totalItems > 20">
            <mu-pagination :total="totalItems"
                :current="currentPage"
                :page-size="pageSize"
                @change="handlePageChange">
            </mu-pagination>
        </div>
    </div>
</template>

<script>
import { stringify } from 'querystring';

import { Track } from '@/util/models';
import TrackList from '@/components/trackList.vue';
import ArtistList from '@/components/artistList.vue';
import PlaylistList from '@/components/playlistList.vue';
import AlbumList from '@/components/albumList.vue';
import UnderConstructionTip from '@/components/underConstructionTip.vue';
import { searchTypes } from '@/util/searchType';
import ApiRenderer from '@/util/apiRenderer';

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
            this.currentPage = newIndex;
            this.updateQueryString();
        },
        updateQueryString() {
            const qs = stringify({
                keyword: this.$route.query.keyword,
                type: this.searchType,
                page: this.currentPage
            });
            this.$router.push(`/search?${qs}`);
        },
        async handleSearch() {
            const { keyword, type = this.searchType, page = this.defaultPage } = this.$route.query;
            if (!keyword) return;
            if (!this.haveSearched) this.haveSearched = true;
            this.currentPage = Number(page);
            this.isPosting = true;
            const resp = await ApiRenderer.search(keyword, type, this.pageSize, this.searchOffset);
            this.isPosting = false;
            if (resp.code === 200) {
                this.searchError = false;
                this.searchErrorCode = -1;
                switch (this.searchType) {
                    case searchTypes.song:
                        this.totalItems = resp.result.songCount;
                        this.items = resp.result.songs.map(i => new Track(i)) || [];
                        break;
                    case searchTypes.artist:
                        this.totalItems = resp.result.artistCount;
                        this.items = resp.result.artists || [];
                        break;
                    case searchTypes.album:
                        this.totalItems = resp.result.albumCount;
                        this.items = resp.result.albums || [];
                        break;
                    case searchTypes.playlist:
                        this.totalItems = resp.result.playlistCount;
                        this.items = resp.result.playlists || [];
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
        ArtistList,
        AlbumList,
        PlaylistList,
        UnderConstructionTip
    }
};
</script>

<style lang="less">
.search {
    .search-tip {
        width: 100%;
        text-align: center;
        margin-top: 100px;
        p {
            color: grey;
        }
    }
    .pagination {
        width: 100%;
        padding: 16px;
    }
}
</style>

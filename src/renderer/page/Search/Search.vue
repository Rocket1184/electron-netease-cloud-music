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
                <mu-tab value="mv">MV</mu-tab>
                <mu-tab value="user">用户</mu-tab>
            </mu-tabs>
        </div>
        <div class="search-content">
            <UnderConstructionTip v-if="searchType === 'mv'"></UnderConstructionTip>
            <UnderConstructionTip v-else-if="searchType === 'user'"></UnderConstructionTip>
            <div v-else-if="!haveSearched"
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
            <TrackList v-else-if="searchType === 'song'"
                :tracks="items"
                :indexOffset="searchOffset"></TrackList>
            <ArtistList v-else-if="searchType === 'artist'"
                :list="items"></ArtistList>
            <AlbumList v-else-if="searchType === 'album'"
                :list="items"></AlbumList>
            <PlaylistList v-else-if="searchType === 'playlist'"
                :list="items"></PlaylistList>
            <div v-else
                class="search-tip">
                <mu-icon value="bug_report"
                    color="grey"
                    :size="128"></mu-icon>
                <p>你是怎么来到这儿的？这不应该啊 ...</p>
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
    </div>
</template>

<script>
import { stringify } from 'querystring';

import { Track } from '@/util/models';
import TrackList from '@/components/TrackList.vue';
import ArtistList from './ArtistList.vue';
import PlaylistList from './PlaylistList.vue';
import AlbumList from './AlbumList.vue';
import UnderConstructionTip from './UnderConstructionTip.vue';
import { searchTypes } from '@/util/searchType';
import Api from '@/util/api';

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
            const resp = await Api.search(keyword, type, this.pageSize, this.searchOffset);
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
    height: 100%;
    display: flex;
    flex-direction: column;
    .search-content {
        height: calc(~'100% - 48px');
        overflow: auto;
    }
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

<template>
    <div class="search">
        <mu-tabs :value="activeTab"
            @change="handleTabChange">
            <mu-tab value="song"
                title="单曲"></mu-tab>
            <mu-tab value="artist"
                title="歌手"></mu-tab>
            <mu-tab value="album"
                title="专辑"></mu-tab>
            <mu-tab value="playlist"
                title="歌单"></mu-tab>
            <mu-tab value="mv"
                title="MV"></mu-tab>
            <mu-tab value="user"
                title="用户"></mu-tab>
        </mu-tabs>
        <div v-if="!haveSearched"
            class="search-tip">
            <mu-icon value="search"
                color="grey"
                :size="128"></mu-icon>
            <p>右上角搜索框内输入，回车搜索！</p>
        </div>
        <div v-else-if="isPosting"
            class="search-tip">
            <mu-circular-progress :size="60"
                :strokeWidth="5"></mu-circular-progress>
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
        <div v-else-if="activeTab === 'song'">
            <TrackList :tracks="items"
                :indexOffset="searchOffset"></TrackList>
        </div>
        <div v-else-if="activeTab === 'artist'">
            <ArtistList :list="items"></ArtistList>
        </div>
        <div v-else-if="activeTab === 'album'">
            <AlbumList :list="items"></AlbumList>
        </div>
        <div v-else-if="activeTab === 'playlist'"></div>
        <div v-else-if="activeTab === 'mv'"></div>
        <div v-else-if="activeTab === 'user'"></div>
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
                :pageSize="pageSize"
                @pageChange="handlePageChange">
            </mu-pagination>
        </div>
    </div>
</template>

<script>
import { stringify } from 'querystring';

import { Track } from 'util/models';
import TrackList from 'compo/trackList';
import ArtistList from 'compo/artistList';
import AlbumList from 'compo/albumList';
import { searchTypes } from 'util/searchType';
import ApiRenderer from 'util/apiRenderer';

export default {
    data() {
        return {
            haveSearched: false,
            haveValidResults: false,
            isPosting: false,
            searchError: false,
            searchErrorCode: null,
            activeTab: 'song',
            currentPage: 1,
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
            this.activeTab = val;
            this.handleSearch();
        },
        async handleSearch() {
            const { keyword, type, page } = this.$route.query;
            if (!keyword) return;
            this.currentPage = Number(page);
            this.haveSearched = true;
            this.isPosting = true;
            const resp = await ApiRenderer.search(keyword, type || this.activeTab, this.pageSize, this.searchOffset);
            this.isPosting = false;
            if (resp.code === 200) {
                switch (this.activeTab) {
                    case searchTypes.song:
                        this.totalItems = resp.result.songCount;
                        this.items = resp.result.songs.map(i => new Track(i)) || [];
                        break;
                    case searchTypes.artist:
                        this.items = resp.result.artists || [];
                        break;
                    case searchTypes.album:
                        this.items = resp.result.albums || [];
                        break;
                    default:
                        break;
                }
                this.haveValidResults = Boolean(this.items.length);
            } else {
                this.searchError = true;
                this.searchErrorCode = resp.code;
            }
        },
        handlePageChange(newIndex) {
            this.currentPage = newIndex;
            const qs = stringify({
                keyword: this.$route.query.keyword,
                type: this.activeTab,
                page: this.currentPage
            });
            this.$router.push(`/search?${qs}`);
        }
    },
    mounted() {
        this.handleSearch();
    },
    beforeRouteUpdate(to, from, next) {
        next();
        this.currentPage = from.query.page;
        this.activeTab = from.query.type;
        this.handleSearch();
    },
    components: {
        TrackList,
        ArtistList,
        AlbumList
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

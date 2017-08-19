<template>
    <div>
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
        <TrackList v-else-if="activeTab === 'song'"
            :list="tracks"></TrackList>
        <ArtistList v-else-if="activeTab === 'artist'"
            :list="artists"></ArtistList>
        <AlbumList v-else-if="activeTab === 'album'"
            :list="albums"></AlbumList>
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
    </div>
</template>

<script>
import { Track } from '../util/models';
import TrackList from '../components/trackList';
import ArtistList from '../components/artistList';
import AlbumList from '../components/albumList';
import { searchTypes } from '../util/searchType';
import ApiRenderer from '../util/apiRenderer';

export default {
    data() {
        return {
            haveSearched: false,
            haveValidResults: false,
            isPosting: false,
            searchError: false,
            searchErrorCode: null,
            activeTab: 'song',
            tracks: [],
            artists: [],
            albums: []
        };
    },
    methods: {
        handleTabChange(val) {
            this.activeTab = val;
            this.handleSearch();
        },
        async handleSearch() {
            const { q, t } = this.$route.query;
            if (!q) return;
            this.haveSearched = true;
            this.isPosting = true;
            const resp = await ApiRenderer.search(q, t || this.activeTab);
            this.isPosting = false;
            if (resp.code === 200) {
                switch (this.activeTab) {
                    case searchTypes.song:
                        this.tracks = resp.result.songs.map(i => new Track(i)) || [];
                        this.haveValidResults = Boolean(this.tracks.length);
                        break;
                    case searchTypes.artist:
                        this.artists = resp.result.artists || [];
                        this.haveValidResults = Boolean(this.artists.length);
                        break;
                    case searchTypes.album:
                        this.albums = resp.result.albums || [];
                        this.haveValidResults = Boolean(this.albums.length);
                        break;
                    default:
                        break;
                }
            } else {
                this.searchError = true;
                this.searchErrorCode = resp.code;
            }
        }
    },
    mounted() {
        this.handleSearch();
    },
    beforeRouteUpdate(to, from, next) {
        next();
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
.search-tip {
    width: 100%;
    text-align: center;
    margin-top: 100px;
    p {
        color: grey;
    }
}
</style>

<template>
    <div class="fav-search">
        <div class="text-field-container">
            <mu-text-field ref="search"
                full-width
                v-model="search"
                placeholder="搜索我的收藏"
                :disabled="!user.loginValid"
                :action-icon="textFieldAction"
                :action-click="clearSearch"
                @input="performSearch"></mu-text-field>
        </div>
        <CenteredTip v-if="!user.loginValid"
            icon="nature_people"
            tip="登录后搜索收藏的资源"></CenteredTip>
        <CenteredTip v-else-if="search.length === 0"
            icon="bookmarks"
            tip="搜索收藏的歌单、专辑、歌手、视频 ..."></CenteredTip>
        <CenteredLoading v-else-if="loading"></CenteredLoading>
        <CenteredTip v-else-if="allEmpty"
            icon="inbox"
            tip="哎呀～什么都没找到 ..."></CenteredTip>
        <mu-list v-else>
            <template v-if="playlists.length > 0">
                <mu-sub-header>歌单</mu-sub-header>
                <PlaylistList :list="playlists"></PlaylistList>
            </template>
            <template v-if="albums.length > 0">
                <mu-sub-header>专辑</mu-sub-header>
                <AlbumList :list="albums"></AlbumList>
            </template>
            <template v-if="artists.length > 0">
                <mu-sub-header>歌手</mu-sub-header>
                <ArtistList :list="artists"></ArtistList>
            </template>
            <template v-if="videos.length > 0">
                <mu-sub-header>视频</mu-sub-header>
                <VideoList :list="videos"></VideoList>
            </template>
        </mu-list>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

import { FetchOnLoginMixin } from './fetch-on-login';

import CenteredTip from '@/components/CenteredTip.vue';
import CenteredLoading from '@/components/CenteredLoading.vue';

import PlaylistList from '@/components/PlaylistList.vue';
import AlbumList from '@/components/AlbumList.vue';
import ArtistList from '@/components/ArtistList.vue';
import VideoList from '@/components/VideoList.vue';

export default {
    name: 'search-favorites',
    mixins: [FetchOnLoginMixin],
    data: () => ({
        search: '',
        loading: false,
        allEmpty: false,
        /** @type {Models.PlayList[]} */
        playlists: [],
        /** @type {Models.Album[]} */
        albums: [],
        /** @type {Models.Artist[]} */
        artists: [],
        /** @type {Models.Video[]} */
        videos: []
    }),
    computed: {
        /** @returns {import('@/store/modules/user').State} */
        user() { return this.$store.state.user; },
        /** @returns {string?} */
        textFieldAction() {
            return this.search.length > 0 ? 'close' : null;
        }
    },
    methods: {
        ...mapActions([
            'updateUserPlaylists',
            'updateUserAlbums',
            'updateUserArtists',
            'updateUserVideos'
        ]),
        focusSearchInput() {
            this.$refs.search.focus();
        },
        clearSearch() {
            this.allEmpty = false;
            this.search = '';
            this.$refs.search.focus();
        },
        fetchData() {
            this.loading = true;
            Promise.all([
                this.updateUserPlaylists(),
                this.updateUserAlbums(),
                this.updateUserArtists(),
                this.updateUserVideos()
            ]).then(() => this.loading = false);
        },
        tabActivated() {
            this.fetchData();
            this.focusSearchInput();
        },
        /**
         * @param {string} input
         */
        performSearch(input) {
            const search = input.toLowerCase();
            if (search.length == 0) {
                this.allEmpty = true;
                this.playlists = [];
                this.albums = [];
                this.artists = [];
                this.videos = [];
                return;
            }
            this.playlists = this.user.playlist.filter(p =>
                p.name.toLowerCase().includes(search) ||
                p.creator.nickname.toLowerCase().includes(search)
            );
            this.albums = this.user.albums.filter(a =>
                a.name.toLowerCase().includes(search) ||
                a.alias.some(n => n.toLowerCase().includes(search)) ||
                a.artists.some(ar =>
                    ar.name.toLowerCase().includes(search) ||
                    ar.alias.some(tn => tn.toLowerCase().includes(search))
                )
            );
            this.artists = this.user.artists.filter(a =>
                a.name.toLowerCase().includes(search) ||
                a.alias.some(tn => tn.toLowerCase().includes(search))
            );
            this.videos = this.user.videos.filter(v =>
                v.name.toLowerCase().includes(search) ||
                v.creator.some(c => c.name.toLowerCase().includes(search))
            );
            this.allEmpty = this.playlists.length === 0 &&
                this.albums.length === 0 &&
                this.artists.length === 0 &&
                this.videos.length === 0;
        }
    },
    mounted() {
        this.tabActivated();
    },
    components: {
        CenteredTip,
        CenteredLoading,
        PlaylistList,
        AlbumList,
        ArtistList,
        VideoList
    }
};
</script>

<style lang="less">
.fav-search {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: center;
    .text-field-container {
        width: 100%;
        max-width: 600px;
        margin: 16px 16px 0;
    }
    .centered-tip {
        flex-grow: 1;
    }
}
</style>

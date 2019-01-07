<template>
    <div class="favorite">
        <div v-elevation="4">
            <mu-tabs inverse
                :value="tab"
                @change="handleTabChange">
                <mu-tab value="playlist">歌单</mu-tab>
                <mu-tab value="album">专辑</mu-tab>
                <mu-tab value="artist">歌手</mu-tab>
                <mu-tab value="video">视频</mu-tab>
            </mu-tabs>
        </div>
        <div class="fav-content">
            <FavPlaylists v-show="tab === 'playlist'"></FavPlaylists>
            <FavAlbums v-show="tab === 'album'"></FavAlbums>
        </div>
    </div>
</template>

<script>
import FavAlbums from './FavAlbums.vue';
import FavPlaylists from './FavPlaylists.vue';

export default {
    name: 'page-favorite',
    data() {
        return {
            tab: 'playlist'
        };
    },
    methods: {
        handleTabChange(val) {
            this.tab = val;
        }
    },
    components: {
        FavAlbums,
        FavPlaylists
    }
};
</script>

<style lang="less">
.favorite {
    height: 100%;
    display: flex;
    flex-direction: column;
    .fav-content {
        height: calc(~'100% - 48px');
    }
}
</style>

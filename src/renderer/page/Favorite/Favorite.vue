<template>
    <div class="favorite">
        <div v-elevation="4">
            <mu-tabs inverse
                :value="tab"
                @change="handelTabChange">
                <mu-tab v-for="tab in  favTabs"
                    :key="tab[0]"
                    :value="tab[0]">{{tab[1]}}</mu-tab>
            </mu-tabs>
        </div>
        <div class="fav-content">
            <transition :name="transitionName"
                mode="out-in">
                <keep-alive>
                    <component :is="favCompo"></component>
                </keep-alive>
            </transition>
        </div>
    </div>
</template>

<script>
import FavAlbums from './FavAlbums.vue';
import FavVideos from './FavVideos.vue';
import FavArtists from './FavArtists.vue';
import FavPlaylists from './FavPlaylists.vue';

const FavTabs = [
    ['playlist', '歌单'],
    ['album', '专辑'],
    ['artist', '歌手'],
    ['video', '视频'],
];

const FavCompos = {
    album: FavAlbums,
    video: FavVideos,
    artist: FavArtists,
    playlist: FavPlaylists,
};

export default {
    name: 'page-favorite',
    data() {
        return {
            tab: 'playlist',
            favTabs: FavTabs,
            transitionName: 'slide-left'
        };
    },
    computed: {
        favCompo() {
            return FavCompos[this.tab];
        }
    },
    methods: {
        handelTabChange(val) {
            let oldIndex, newIndex;
            FavTabs.forEach((tab, index) => {
                if (tab[0] === this.tab) oldIndex = index;
                if (tab[0] === val) newIndex = index;
            });
            if (newIndex < oldIndex) {
                this.transitionName = 'slide-right';
            } else {
                this.transitionName = 'slide-left';
            }
            this.tab = val;
        },
    },
    components: {
        FavAlbums,
        FavVideos,
        FavArtists,
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
        overflow-x: hidden;
    }
}
</style>

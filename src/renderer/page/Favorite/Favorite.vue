<template>
    <div class="favorite ncm-page">
        <mu-tabs class="fav-tab"
            inverse
            :value="tab"
            @change="handelTabChange">
            <mu-tab v-for="tab of FavTabs"
                :key="tab[0]"
                :value="tab[0]">{{tab[1]}}</mu-tab>
        </mu-tabs>
        <div class="fav-content">
            <transition :name="transitionName"
                mode="out-in">
                <component :is="favCompo"></component>
            </transition>
        </div>
    </div>
</template>

<script>
import FavAlbums from './FavAlbums.vue';
import FavVideos from './FavVideos.vue';
import FavArtists from './FavArtists.vue';
import FavPlaylists from './FavPlaylists.vue';
import FavDjRadios from './FavDjRadios.vue';

const FavTabs = [
    ['playlist', '歌单'],
    ['album', '专辑'],
    ['artist', '歌手'],
    ['video', '视频'],
    ['djradio', '电台']
];

const FavCompo = {
    album: 'FavAlbums',
    video: 'FavVideos',
    artist: 'FavArtists',
    playlist: 'FavPlaylists',
    djradio: 'FavDjRadios'
};

export default {
    name: 'favorite',
    data() {
        return {
            tab: 'playlist',
            transitionName: 'slide-left'
        };
    },
    computed: {
        favCompo() {
            return FavCompo[this.tab];
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
        }
    },
    created() {
        this.FavTabs = FavTabs;
    },
    components: {
        FavAlbums,
        FavVideos,
        FavArtists,
        FavPlaylists,
        FavDjRadios
    }
};
</script>

<style lang="less">
.favorite {
    height: 100%;
    display: flex;
    flex-direction: column;
    .fav-tab {
        z-index: 10;
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.4);
    }
    .fav-content {
        height: calc(~'100% - 48px');
        overflow-x: hidden;
    }
}
</style>

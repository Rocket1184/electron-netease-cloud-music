<template>
    <div class="favorite ncm-page">
        <mu-tabs class="fav-tab"
            inverse
            :value="tab"
            @change="handelTabChange">
            <mu-tab v-for="tab of FavTabs"
                :key="tab.key"
                :value="tab.key">
                <mu-icon v-if="tab.icon"
                    :value="tab.icon"></mu-icon>
                <span v-else
                    v-text="tab.title"></span>
            </mu-tab>
        </mu-tabs>
        <div class="fav-content">
            <transition mode="out-in"
                :name="transitionName"
                @after-enter="handleTabPageEnter">
                <component ref="tabPage"
                    :is="favCompo"></component>
            </transition>
        </div>
    </div>
</template>

<script>
import SearchFavorites from './SearchFavrites.vue';
import FavAlbums from './FavAlbums.vue';
import FavVideos from './FavVideos.vue';
import FavArtists from './FavArtists.vue';
import FavPlaylists from './FavPlaylists.vue';
import FavDjRadios from './FavDjRadios.vue';

/** @typedef {{ key: string, title?: string, icon?: string }} FavTab */

/** @type {FavTab[]} */
const FavTabs = [
    { key: 'search', icon: 'search' },
    { key: 'playlist', title: '歌单' },
    { key: 'album', title: '专辑' },
    { key: 'artist', title: '歌手' },
    { key: 'video', title: '视频' },
    { key: 'djradio', title: '电台' }
];

const FavCompos = {
    search: 'SearchFavorites',
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
        /** @returns {FavTab[]} */
        FavTabs() { return FavTabs; },
        /** @returns {string} */
        favCompo() {
            return FavCompos[this.tab];
        }
    },
    methods: {
        /** @param {string} newTab */
        handelTabChange(newTab) {
            let oldIndex, newIndex;
            FavTabs.forEach((tab, index) => {
                if (tab.key === this.tab) oldIndex = index;
                if (tab.key === newTab) newIndex = index;
            });
            if (newIndex < oldIndex) {
                this.transitionName = 'slide-right';
            } else {
                this.transitionName = 'slide-left';
            }
            this.tab = newTab;
        },
        handleTabPageEnter() {
            this.$refs.tabPage.tabActivated?.call();
        }
    },
    activated() {
        this.$refs.tabPage.tabActivated?.call();
    },
    components: {
        SearchFavorites,
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
        .mu-tab:first-child {
            min-width: 72px !important;
            .mu-icon {
                margin: 0;
            }
        }
    }
    .fav-content {
        height: calc(~'100% - 48px');
        overflow-x: hidden;
    }
}
</style>

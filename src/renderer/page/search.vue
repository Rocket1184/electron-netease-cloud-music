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
        <div v-if="activeTab === 'song'">
            <trackList :list="tracks"></trackList>
        </div>
    </div>
</template>

<script>
import { Track } from '../util/models';
import trackList from '../components/trackList';
import { searchTypes } from '../util/searchType';
import ApiRenderer from '../util/apiRenderer';

export default {
    data() {
        return {
            activeTab: 'song',
            tracks: []
        };
    },
    methods: {
        handleTabChange(val) {
            this.activeTab = val;
        },
        async handleSearch() {
            const { q, t } = this.$route.query;
            const resp = await ApiRenderer.search(q, t || searchTypes.song);
            if (resp.code === 200) {
                this.tracks = resp.result.songs.map(i => new Track(i)) || [];
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
        trackList
    }
};
</script>

<style lang="less">

</style>

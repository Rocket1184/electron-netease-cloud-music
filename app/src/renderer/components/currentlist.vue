<template>
    <mu-list>
        <template v-for="(track, index) in playlist.list">
            <mu-list-item :title="track.name"
                          :afterText="track | formatArtists"
                          @click="handleListClick(index)">
                <mu-icon v-if=""
                         slot="left"
                         :value="track.id==playingMusic.id ? 'volume_up' : ''" />
            </mu-list-item>
        </template>
    </mu-list>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    data() {
        return {};
    },
    computed: {
        ...mapGetters([
            'playlist',
            'playingMusic'
        ])
    },
    filters: {
        formatArtists(track) {
            const ar = track.ar || track.artists;
            return ar.map(a => a.name).join('/');
        }
    },
    methods: {
        ...mapActions([
            'playTrackIndex'
        ]),
        handleListClick(index) {
            this.playTrackIndex({ index });
        }
    }
};
</script>

<style lang="less">

</style>

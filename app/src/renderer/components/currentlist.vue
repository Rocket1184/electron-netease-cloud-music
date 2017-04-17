<template>
    <mu-list>
        <template v-for="(song, index) in playlist.list">
            <mu-list-item :title="song.name"
                          :afterText="song.artists.map(i => i.name).join(' / ')"
                          @click="handleListClick(index)">
                <mu-icon v-if=""
                         slot="left"
                         :value="song.id==playingMusic.id ? 'volume_up' : ''" />
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

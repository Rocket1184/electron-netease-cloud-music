<template>
    <mu-list>
        <template v-for="(track, index) in playlist.list">
            <mu-list-item :title="track.name"
                          :afterText="track.artistName"
                          @click="handleListClick(index)">
                <mu-icon v-if=""
                         slot="left"
                         :value="track.id==playing.track.id ? 'volume_up' : ''" />
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
            'playing'
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

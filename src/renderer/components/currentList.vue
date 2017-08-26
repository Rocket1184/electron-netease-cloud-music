<template>
    <mu-list class="current-list">
        <mu-list-item v-for="(track, index) in playlist.list"
            :key="track.id"
            :title="track.name"
            titleClass="track-name"
            :afterText="track.artistName"
            afterTextClass="track-artist"
            @click="handleListClick(index)">
            <mu-icon v-if="track.id == playing.track.id"
                slot="left"
                value="volume_up">
            </mu-icon>
            <span v-else
                slot="left"
                class="ellipsis-text-16px">
                {{index + 1}}
            </span>
        </mu-list-item>
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
.current-list {
    width: 600px;
    background-color: white;
    overflow-y: scroll;
    .ellipsis-text-16px {
        font-size: 16px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .track-name {
        max-width: 70%;
        .ellipsis-text-16px;
    }
    .track-artist {
        display: block;
        max-width: 30%;
        .ellipsis-text-16px;
    }
}
</style>

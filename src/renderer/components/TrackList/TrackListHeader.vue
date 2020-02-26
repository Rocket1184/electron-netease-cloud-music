<template>
    <div class="tracklist__header">
        <mu-button flat
            class="tracklist__play"
            @click="handlePlay"
            v-bind="$attrs">
            <mu-icon left
                :size="20"
                color="grey"
                value="play_circle_filled"></mu-icon>
            <span>{{ btnPlayText }}</span>
        </mu-button>
        <slot></slot>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    inheritAttrs: false,
    props: {
        tracks: {
            type: Array,
            required: true
        },
        source: {
            type: Object
        },
        count: {
            type: Number
        }
    },
    computed: {
        btnPlayText() {
            return `播放全部 (${this.count || this.tracks.length})`;
        }
    },
    methods: {
        ...mapActions([
            'playPlaylist'
        ]),
        handlePlay() {
            this.playPlaylist({ tracks: this.tracks, source: this.source });
        }
    }
};
</script>

<style lang="less">
.tracklist__header {
    height: 40px;
    display: flex;
    align-items: center;
    .tracklist__play {
        height: 30px;
        line-height: 30px;
        margin-left: 6px;
        .mu-button-wrapper {
            padding: 0 7px;
            .mu-icon-left {
                margin-right: 13px;
            }
        }
    }
}
</style>

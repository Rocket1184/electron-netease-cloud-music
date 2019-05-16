<template>
    <mu-button flat
        v-bind="$attrs"
        @click="handlePlayAll">
        <mu-icon left
            value="play_circle_outline"></mu-icon>
        <span>{{btnPlayText}}</span>
    </mu-button>
</template>

<script>
import PlayTracks from '@/components/PlayTracks.vue';

export default {
    extends: PlayTracks,
    inheritAttrs: false,
    computed: {
        btnPlayText() {
            return `播放全部 (${this.tracks.length})`;
        }
    }
};
</script>

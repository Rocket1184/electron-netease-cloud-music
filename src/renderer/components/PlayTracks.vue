<template>
    <div class="play-all"
        @click="handlePlayAll">
        <mu-ripple class="ripple-wrapper">
            <mu-icon value="play_circle_filled"></mu-icon>
            <span>播放全部</span>
        </mu-ripple>
        <mu-divider></mu-divider>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    props: {
        tracks: {
            type: Array,
            required: true
        }
    },
    methods: {
        ...mapActions([
            'playPlaylist'
        ]),
        handlePlayAll() {
            this.playPlaylist(this.tracks);
        }
    }
};
</script>

<style lang="less">
.play-all {
    cursor: pointer;
    position: relative;
    .ripple-wrapper {
        i {
            vertical-align: top;
            line-height: 48px;
            text-align: center;
            font-size: 20px;
            width: 48px;
            color: grey;
        }
        span {
            line-height: 48px;
            padding: 0 8px;
            user-select: none;
        }
    }
}
</style>

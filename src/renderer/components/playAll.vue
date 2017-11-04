<template>
    <div class="play-all">
        <mu-list-item title="播放全部"
            @click="handlePlayAll">
            <mu-icon slot="left"
                value="play_circle_filled"></mu-icon>
        </mu-list-item>
        <mu-divider></mu-divider>
    </div>
</template>

<script>
import {mapActions} from 'vuex';

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
            this.playPlaylist({ list: this.tracks });
        }
    }
};
</script>

<style lang="less">
    .play-all {
        .mu-icon {
            font-size: 20px;
        }
        .mu-item {
            .mu-item-title {
                padding-left: 8px;
                font-size: 14px;
            }
        }
    }
</style>

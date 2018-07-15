<template>
    <div class="current-list">
        <div v-if="playlist.list.length === 0"
            class="tip">
            <mu-icon value="equalizer"
                color="grey"
                :size="128"></mu-icon>
            <p>列表里什么都没有，快去找几首歌吧 φ(≧ω≦*)♪</p>
        </div>
        <mu-list v-else
            class="list">
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
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
    data() {
        return {};
    },
    computed: {
        ...mapState(['playlist']),
        ...mapGetters(['playing'])
    },
    methods: {
        ...mapActions(['playTrackIndex']),
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
    font-size: 14px;
    .tip {
        width: 100%;
        height: 100%;
        color: grey;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .list {
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
}
</style>

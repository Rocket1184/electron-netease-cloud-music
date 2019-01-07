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
            dense
            class="list">
            <mu-list-item v-for="(track, index) in playlist.list"
                button
                :key="track.id"
                :id="`cur-list-${index}`"
                @click="handleListClick(index)">
                <mu-list-item-action>
                    <mu-icon v-if="track.id == playlist.list[playlist.index].id"
                        color="secondary"
                        value="volume_up">
                    </mu-icon>
                    <span v-else>{{index + 1}}</span>
                </mu-list-item-action>
                <mu-list-item-title class="track-name">
                    {{track.name}}
                    <span class="track-artist">{{track.artistName}}</span>
                </mu-list-item-title>
            </mu-list-item>
        </mu-list>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
    computed: {
        ...mapState(['playlist'])
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
    height: inherit;
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
        padding: 0;
        .mu-item-action {
            width: 36px;
            min-width: 0;
        }
        i {
            font-size: 18px;
        }
        .track-artist {
            color: grey;
            font-size: 0.8em;
            &::before {
                content: ' - ';
            }
        }
    }
}
</style>

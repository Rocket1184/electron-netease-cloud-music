<template>
    <div class="tracklist">
        <template v-if="tracks.length !== 0">
            <div class="list">
                <div class="track-row"
                    v-for="(track, index) in tracks"
                    :key="index"
                    @dblclick="handlePlay(index)">
                    <div class="track-col index">{{index + 1 + indexOffset}}</div>
                    <div class="track-col name">{{track.name}}</div>
                    <div class="track-col artist">{{track.artistName}}</div>
                    <div class="track-col duration">{{track.duration / 1000 | shortTime}}</div>
                    <div class="track-col buttons">
                        <mu-button icon
                            title="收藏到歌单"
                            @click="handleCollect(track.id)">
                            <mu-icon value="bookmark_border"></mu-icon>
                        </mu-button>
                        <mu-button icon
                            title="添加到播放列表"
                            @click="handleAdd(index)">
                            <mu-icon value="playlist_add"></mu-icon>
                        </mu-button>
                    </div>
                </div>
            </div>
        </template>
        <div v-else
            class="loading-wrapper">
            <mu-circular-progress color="secondary"
                :size="60"
                :stroke-width="5"></mu-circular-progress>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { shortTime } from '@/util/formatter';

export default {
    props: {
        tracks: {
            type: Array,
            required: true
        },
        indexOffset: {
            type: Number,
            default: 0,
            required: false
        }
    },
    filters: {
        shortTime
    },
    computed: {
        ...mapState(['ui', 'user', 'playlist'])
    },
    methods: {
        ...mapActions([
            'playPerviousTrack',
            'playTrackIndex',
            'toggleCollectPopup',
            'insertTrackIntoPlaylist'
        ]),
        handleCollect(id) {
            if (!this.user.loginValid) {
                this.$toast.message('汝还没有登录呀      (눈‸눈)');
                return;
            }
            this.toggleCollectPopup(id);
        },
        handleAdd(index) {
            try {
                this.insertTrackIntoPlaylist({
                    tracks: [this.tracks[index]],
                    index: this.playlist.list.length
                });
                this.$toast.message('已添加到播放列表  _(:з」∠)_');
            } catch (e) { /* 为什么会这样呢 */ }
        },
        handlePlay(index) {
            const track = this.tracks[index];
            const i = this.playlist.list.findIndex(t => t.id === track.id);
            if (i > -1) {
                this.playTrackIndex({ index: i });
                return;
            }
            this.insertTrackIntoPlaylist({
                tracks: [this.tracks[index]],
                index: this.playlist.index
            });
            const newIndex = this.playlist.list.findIndex(t => t.id === track.id);
            this.playTrackIndex({ index: newIndex });
        }
    }
};
</script>

<style lang="less">
.tracklist {
    width: 100%;
    .list {
        .track-row {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            .track-col {
                height: 48px;
                line-height: 48px;
            }
            .index {
                flex: 1 0 0;
                max-width: 48px;
                text-align: center;
            }
            .name,
            .artist {
                flex: 1 1 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding: 0 8px;
            }
            .duration {
                flex: 0 0 64px;
            }
            .buttons {
                i {
                    color: grey;
                }
                .mu-button.hover:before {
                    border-radius: 50%;
                }
            }
        }
    }
    .loading-wrapper {
        height: 400px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
}
</style>

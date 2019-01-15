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
        <CenteredTip v-else
            icon="inbox"
            tip="没有歌曲  (ÒωÓױ)"></CenteredTip>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import { shortTime } from '@/util/formatter';
import CenteredTip from './CenteredTip.vue';

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
        ...mapState(['user', 'playlist'])
    },
    methods: {
        ...mapActions([
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
        /**
         * find track specified by given index in current playlist 
         * @param {number} index track index in `this.tracks`
         * @returns {number}
         */
        findTrackInPlaylist(index) {
            const track = this.tracks[index];
            return this.playlist.list.findIndex(t => t.id === track.id);
        },
        handleAdd(index) {
            if (this.findTrackInPlaylist(index) > -1) {
                // track exists in playlist
                this.$toast.message('已经在播放列表中了  ( >﹏<。)～');
                return;
            }
            this.insertTrackIntoPlaylist({
                tracks: [this.tracks[index]],
                index: this.playlist.list.length
            });
            this.$toast.message('已添加到播放列表  _(:з」∠)_');
        },
        handlePlay(index) {
            const i = this.findTrackInPlaylist(index);
            if (i > -1) {
                // track exists in playlist
                this.playTrackIndex(i);
                return;
            }
            this.insertTrackIntoPlaylist({
                tracks: [this.tracks[index]],
                index: this.playlist.index
            });
            const newIndex = this.findTrackInPlaylist(index);
            this.playTrackIndex(newIndex);
        }
    },
    components: {
        CenteredTip
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
                .mu-icon {
                    opacity: 0.6;
                }
            }
        }
    }
    .centered-tip {
        height: 220px;
    }
}
</style>

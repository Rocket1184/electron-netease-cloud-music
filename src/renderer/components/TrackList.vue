<template>
    <div class="tracklist">
        <template v-if="tracks.length !== 0">
            <div class="list">
                <ncm-mu-dbclick-ripple class="track-row"
                    v-for="(track, index) in tracks"
                    :key="index"
                    @dblclick="handlePlay(index)">
                    <div class="track-col index">
                        <div class="index-num">{{index + 1 + indexOffset}}</div>
                        <div class="index-btn"
                            title="播放"
                            @click="handlePlay(index)">
                            <mu-icon value="play_circle_outline"></mu-icon>
                        </div>
                    </div>
                    <div class="track-col name">{{track.name}}</div>
                    <div class="track-col artist">
                        <template v-for="(ar, index) in track.artists">
                            <span v-if="index !== 0"
                                :key="'sep' + index"
                                class="sep">/</span>
                            <router-link v-if="ar.id !== 0"
                                class="link"
                                :to="{ name: 'artist', params: { id: ar.id } }"
                                :key="ar.id">{{ar.name}}</router-link>
                            <span v-else
                                :key="'ar' + index">{{ar.name}}</span>
                        </template>
                    </div>
                    <div class="track-col duration">{{track.duration / 1000 | shortTime}}</div>
                    <div class="track-col buttons">
                        <mu-button icon
                            title="收藏到歌单"
                            @click="handleCollect(track.id)">
                            <mu-icon value="bookmark_border"></mu-icon>
                        </mu-button>
                        <mu-button v-if="!isRadio"
                            icon
                            title="添加到播放列表"
                            @click="handleAdd(index)">
                            <mu-icon value="playlist_add"></mu-icon>
                        </mu-button>
                    </div>
                </ncm-mu-dbclick-ripple>
            </div>
        </template>
        <CenteredTip v-else
            icon="inbox"
            tip="没有歌曲  (ÒωÓױ)"></CenteredTip>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import { shortTime } from '@/util/formatter';
import CenteredTip from './CenteredTip.vue';

export default {
    props: {
        tracks: {
            type: Array,
            required: true
        },
        source: {
            required: false
        },
        indexOffset: {
            type: Number,
            default: 0,
            required: false
        },
        isRadio: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    filters: {
        shortTime
    },
    computed: {
        ...mapState(['ui', 'user', 'playlist']),
        ...mapGetters(['queue'])
    },
    methods: {
        ...mapActions([
            'activateRadio',
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
            if (this.ui.radioMode) {
                this.$toast.message('正在播放私人 FM，无法添加到播放列表');
                return;
            }
            if (this.findTrackInPlaylist(index) > -1) {
                // track exists in playlist
                this.$toast.message('已经在播放列表中了  ( >﹏<。)～');
                return;
            }
            this.insertTrackIntoPlaylist({
                tracks: [this.tracks[index]],
                source: this.source,
                index: this.playlist.list.length
            });
            this.$toast.message('已添加到播放列表  _(:з」∠)_');
        },
        handlePlay(index) {
            if (this.ui.radioMode) {
                if (this.isRadio) {
                    this.playTrackIndex(index);
                    return;
                } else {
                    this.$toast.message('已退出私人 FM');
                    this.activateRadio(false);
                }
            }
            const i = this.findTrackInPlaylist(index);
            if (i > -1) {
                // track exists in playlist
                this.playTrackIndex(i);
                return;
            }
            this.insertTrackIntoPlaylist({
                tracks: [this.tracks[index]],
                source: this.source,
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
    user-select: none;
    .list {
        .track-row {
            position: relative;
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
                position: relative;
                .index-num,
                .index-btn {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    transition-property: opacity;
                    transition-duration: 0.3s;
                }
                .index-btn {
                    opacity: 0;
                    cursor: pointer;
                    .mu-icon {
                        line-height: 48px;
                    }
                }
                &:hover {
                    .index-btn {
                        opacity: 0.6;
                    }
                    .index-num {
                        opacity: 0;
                    }
                }
            }
            .name,
            .artist {
                flex: 1 1 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding: 0 8px;
                z-index: 1;
                .link {
                    color: inherit;
                    &:hover {
                        text-decoration: underline;
                    }
                }
                .sep {
                    margin: 0 6px;
                }
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

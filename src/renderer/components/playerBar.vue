<template>
    <div class="player-bar-wrapper">
        <div class="cell cover">
            <router-link to='/player'>
                <div class="img"
                    :style="coverImgStyle"></div>
            </router-link>
        </div>
        <div class="cell info">
            <span class="song-name">{{track.name}}</span>
            <span class="artist-name">{{track.artistName}}</span>
            <div class="quick-actions">
                <mu-checkbox title="喜欢"
                    class="action-item"
                    ref="chkFavorite"
                    uncheck-icon="favorite_border"
                    checked-icon="favorite"
                    color="red"
                    v-model="isFavorite"></mu-checkbox>
                <mu-checkbox title="收藏到歌单"
                    class="action-item"
                    ref="chkShowPlaylists"
                    uncheck-icon="bookmark_border"
                    checked-icon="bookmark"
                    v-model="playlistsShown"></mu-checkbox>
                <mu-checkbox title="播放列表"
                    class="action-item"
                    uncheck-icon="queue_music"
                    checked-icon="queue_music"
                    v-model="currentListShown"></mu-checkbox>
            </div>
            <div class="progress">
                <mu-slider id="playerbar-progress"
                    :display-value="false"
                    class="slider"
                    :value="songProgress"
                    @change="handleProgressDrag"></mu-slider>
                <span class="text">{{ timeCurrent | time }} / {{ timeTotal | time }}</span>
            </div>
        </div>
        <div class="cell control">
            <mu-button fab
                small
                class="button"
                @click="playPreviousTrack">
                <mu-icon value="skip_previous"></mu-icon>
            </mu-button>
            <mu-button fab
                class="button"
                @click="handlePlayOrPause">
                <mu-icon :value="this.audioEl.paused ? 'play_arrow' : 'pause'"></mu-icon>
            </mu-button>
            <mu-button fab
                small
                class="button"
                @click="playNextTrack">
                <mu-icon value="skip_next"></mu-icon>
            </mu-button>
        </div>
        <currentList :open="currentListShown"></currentList>
    </div>
</template>

<script>
import { platform } from 'os';
import { mapActions, mapGetters, mapState } from 'vuex';

import ApiRenderer from '@/util/apiRenderer';
import currentList from './currentList.vue';
import {
    HIDE_COLLECT_POPUP,
    PAUSE_PLAYING_MUSIC,
    RESUME_PLAYING_MUSIC
} from '@/vuex/mutation-types';
import { sizeImg, HiDpiPx, bkgImg } from '@/util/image';
import { shortTime } from '@/util/formatter';

export default {
    data() {
        return {
            audioEl: {},
            timeTotal: 0,
            timeCurrent: 0,
            shouldFavorite: null,
            realPlaylistsShown: false,
            currentListShown: false
        };
    },
    methods: {
        ...mapActions([
            'playAudio',
            'pauseAudio',
            'playNextTrack',
            'playPreviousTrack',
            'refreshUserPlaylist',
            'toggleCollectPopup'
        ]),
        handlePlayOrPause() {
            this.ui.audioSrc && (this.audioEl.paused ? this.playAudio() : this.pauseAudio());
        },
        handleProgressDrag(value) {
            this.audioEl.currentTime = this.timeTotal * value / 100;
        },
        submitListened() {
            ApiRenderer.submitListened(this.playing.track.id, this.timeTotal);
        },
        async handleFavorite() {
            if (!this.loginValid || !this.playing.track) {
                this.$toast.message('真的这么喜欢我吗 o(*////▽////*)q');
                return;
            }
            const list = this.user.favoriteList;
            const track = this.playing.track;
            if (list.tracks.find(t => t.id === track.id)) {
                await ApiRenderer.uncollectTrack(list.id, track.id);
            } else {
                await ApiRenderer.collectTrack(list.id, track.id);
            }
            // it would take some time for NetEase to update playlist cover
            // img, so we just wait 200 ms
            setTimeout(async () => {
                await this.refreshUserPlaylist(list.id);
                this.shouldFavorite = null;
            }, 0);
        }
    },
    computed: {
        ...mapGetters(['playing', 'user', 'loginValid']),
        ...mapState(['playlist', 'ui']),
        track() {
            return this.playing.track || ({ name: 'Electron Netease Cloud Music' });
        },
        coverImgStyle() {
            if (this.playing.track && this.playing.track.album.picUrl) {
                return bkgImg(sizeImg(this.playing.track.album.picUrl, HiDpiPx(64)));
            }
        },
        isFavorite: {
            get() {
                if (!this.loginValid || !this.playing.track) {
                    return false;
                }
                if (this.shouldFavorite !== null) {
                    return this.shouldFavorite;
                }
                const { favoriteList } = this.user;
                if (favoriteList) {
                    const track = favoriteList.tracks.find(t => t.id === this.playing.track.id);
                    return typeof track === 'object';
                }
                return false;
            },
            set(val) {
                if (val === true) {
                    this.shouldFavorite = true;
                } else {
                    this.shouldFavorite = false;
                }
                this.handleFavorite();
            }
        },
        playlistsShown: {
            get() { return this.realPlaylistsShown; },
            set(val) {
                if (!this.loginValid && val === true && this.realPlaylistsShown === false) {
                    this.$toast.message('汝还没有登录呀      (눈‸눈)');
                    // set value of real `<input>` element to `false`.
                    // it depends on MuseUI impl
                    this.$refs.chkShowPlaylists.inputValue = false;
                    return;
                }
                if (!this.playing.track) {
                    this.$toast.message('究竟想收藏什么呢     (｡ŏ_ŏ)');
                    this.$refs.chkShowPlaylists.inputValue = false;
                    return;
                }
                this.realPlaylistsShown = val;
                if (val === true) {
                    this.toggleCollectPopup(this.playing.track.id);
                }
            }
        },
        songProgress() {
            return 100 * this.timeCurrent / this.timeTotal || 0;
        }
    },
    filters: {
        time: shortTime
    },
    mounted() {
        /** @type {HTMLAudioElement} */
        const _audioEl = document.getElementById('playerbar-audio');
        let _playingIntervalId;
        this.audioEl = _audioEl;

        const _updateTime = () => this.timeCurrent = this.audioEl.currentTime;
        const _unsetInterval = () => _playingIntervalId = clearInterval(_playingIntervalId);

        _audioEl.addEventListener('loadedmetadata', () => {
            _unsetInterval();
            this.timeTotal = _audioEl.duration;
            this.timeCurrent = _audioEl.currentTime = 0;
            if (!this.ui.paused) _audioEl.play();
        });

        _audioEl.addEventListener('seeking', _updateTime);

        _audioEl.addEventListener('playing', () => {
            _updateTime();
            // update playing process time after the time reachs a 'integer' second
            // why use 1.1 not 1 ? maybe there is a little lag in event loop... I dont know
            const timeOut = (1.1 - _audioEl.currentTime % 1) * 1000;
            setTimeout(() => {
                _updateTime();
                // only set interval when it's not set, to avoid massive events
                if (!_playingIntervalId)
                    _playingIntervalId = setInterval(() => _updateTime(), 1000);
            }, timeOut);
        });

        _audioEl.addEventListener('pause', () => _updateTime() && _unsetInterval());

        _audioEl.addEventListener('ended', () => {
            this.submitListened();
            this.playNextTrack();
        });

        this.$store.subscribe(mutation => {
            switch (mutation.type) {
                case PAUSE_PLAYING_MUSIC:
                    _audioEl.pause();
                    break;
                case RESUME_PLAYING_MUSIC:
                    _audioEl.play();
                    break;
                case HIDE_COLLECT_POPUP:
                    this.playlistsShown = false;
                    break;
            }
        });

        if (platform() === 'linux') {
            require('@/util/mpris').bindEventListener(_audioEl);
        }
    },
    components: {
        currentList
    }
};
</script>

<style lang="less">
.player-bar-wrapper {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
    display: flex;
    user-select: none;
    cursor: default;
    font-size: 0;
    height: 64px;
    position: relative;
    .cell {
        min-width: 64px;
        vertical-align: top;
        height: 64px;
    }
    .cover {
        .img {
            background-image: url('~assets/img/cover_default.webp');
            background-size: cover;
            width: 64px;
            height: 64px;
        }
    }
    .info {
        font-size: 14px;
        padding: 10px 14px;
        width: calc(~'100% - 244px');
        overflow: hidden;
        .song-name,
        .artist-name {
            display: inline-block;
            max-width: 310px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .artist-name {
            margin-left: 10px;
            color: dimgrey;
        }
        .quick-actions {
            position: absolute;
            top: -5px;
            right: 180px;
            .action-item {
                margin: 12px 12px 0 0;
            }
        }
        .progress {
            position: relative;
            .slider {
                margin: 0;
                width: calc(~'100% - 100px');
            }
            .text {
                position: absolute;
                right: 0;
                top: 0;
                width: 100px;
                text-align: right;
            }
        }
    }
    .control {
        width: 180px;
        padding: 4px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        .button {
            box-shadow: white 0 0 0;
        }
    }
    .current-list {
        position: fixed;
        right: 4px;
        bottom: 68px;
        height: 496px;
        -webkit-transform-origin-y: 496px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    }
}

.list-open-up-enter-active,
.list-open-up-leave-active {
    transition: transform 0.5s;
    transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}

.list-open-up-enter,
.list-open-up-leave-active {
    transform: scaleY(0);
}
</style>

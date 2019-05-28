<template>
    <div class="player-bar">
        <div class="cover"
            @click="handleCoverClick">
            <div class="img"
                :style="coverImgStyle">
            </div>
            <mu-icon :value="coverIcon"
                :size="48"
                color="white"></mu-icon>
        </div>
        <div class="info">
            <div class="desc">
                <div class="name">
                    <span class="song">{{playing.name}}</span>
                    <span class="artist mu-item-after-text">{{playing.artistName}}</span>
                </div>
                <div class="shortcut">
                    <div title="喜欢">
                        <mu-checkbox uncheck-icon="favorite_border"
                            checked-icon="favorite"
                            color="red"
                            :inputValue="isFavorite"
                            @click="handleFavorite"></mu-checkbox>
                    </div>
                    <mu-menu :open.sync="volumeShown"
                        placement="top"
                        popover-class="playerbar-volume"
                        title="音量">
                        <mu-checkbox :uncheck-icon="iconVolume"
                            :checked-icon="iconVolume"
                            color="secondary"
                            :inputValue="volumeShown"
                            @wheel.passive="handleVolumeWheel"
                            @auxclick="handleVolumeMute"></mu-checkbox>
                        <template #content>
                            <div class="content"
                                @mouseenter="cancelHideVolume"
                                @mouseleave="scheduleHideVolume"
                                @wheel.passive="handleVolumeWheel">
                                <mu-slider :value="ui.audioVolume"
                                    :min="0"
                                    :max="100"
                                    :step="1"
                                    :disabled="ui.audioMute"
                                    :display-value="false"
                                    @change="handleVolumeChange"></mu-slider>
                                <span class="value">{{ui.audioVolume}}</span>
                            </div>
                        </template>
                    </mu-menu>
                    <div v-if="ui.radioMode"
                        title="不喜欢">
                        <mu-checkbox uncheck-icon="delete_outline"
                            @click="handleRadioDislike"></mu-checkbox>
                    </div>
                    <div v-else
                        title="循环模式">
                        <mu-checkbox :uncheck-icon="iconLoopMode"
                            @click="handleLoopMode"></mu-checkbox>
                    </div>
                    <mu-menu :open.sync="currentListShown"
                        placement="top"
                        popover-class="playerbar-current-list"
                        title="播放列表">
                        <mu-checkbox uncheck-icon="queue_music"
                            checked-icon="queue_music"
                            color="secondary"
                            :inputValue="currentListShown"></mu-checkbox>
                        <template #content>
                            <CurrentPlaylist ref="list" @navigate="handleSourceNavigate"></CurrentPlaylist>
                        </template>
                    </mu-menu>
                </div>
            </div>
            <div class="progress">
                <mu-slider id="playerbar-progress"
                    :display-value="false"
                    :value="songProgress"
                    @change="handleProgressDrag"></mu-slider>
                <span class="time">{{ timeCurrent | time }} / {{ timeTotal | time }}</span>
            </div>
        </div>
        <div class="control">
            <mu-button fab
                small
                class="button"
                @click="handlePrev">
                <mu-icon value="skip_previous"></mu-icon>
            </mu-button>
            <mu-button fab
                class="button"
                @click="handlePlayPause">
                <mu-icon :value="iconPlayPause"></mu-icon>
            </mu-button>
            <mu-button fab
                small
                class="button"
                @click="handleNext">
                <mu-icon value="skip_next"></mu-icon>
            </mu-button>
        </div>
    </div>
</template>

<script>
import { platform } from 'os';
import { mapActions, mapGetters, mapState } from 'vuex';

import Api from '@/api/ipc';
import CurrentPlaylist from './VirtualCurrentPlaylist.vue';
import {
    UPDATE_PLAYING_URL,
    SET_AUDIO_VOLUME,
    SET_AUDIO_PAUSED
} from '@/store/mutation-types';
import { LOOP_MODE } from '@/store/modules/playlist';
import { sizeImg, HiDpiPx, bkgImg } from '@/util/image';
import { shortTime } from '@/util/formatter';

const VolumeIcon = [
    'volume_off',
    'volume_mute',
    'volume_down',
    'volume_up'
];

export default {
    data() {
        return {
            /** @type {HTMLAudioElement} */
            audioEl: null,
            hasRetried: false,
            timeTotal: 0,
            timeCurrent: 0,
            shouldFavorite: null,
            volumeShown: false,
            volumeHideTimeoutId: -1,
            currentListShown: false
        };
    },
    methods: {
        ...mapActions([
            'playAudio',
            'pauseAudio',
            'updateUiAudioSrc',
            'setAudioVolume',
            'playNextTrack',
            'playPreviousTrack',
            'updateFavoriteTrackIds',
            'favoriteTrack',
            'nextLoopMode',
            'likeRadio',
            'skipRadio',
            'trashRadio'
        ]),
        handleCoverClick() {
            if (this.$route.name === 'player') {
                this.$router.back();
                return;
            }
            this.$router.push({ name: 'player' });
        },
        handlePrev() {
            this.playPreviousTrack();
        },
        handlePlayPause() {
            this.ui.audioSrc && (this.ui.paused ? this.playAudio() : this.pauseAudio());
        },
        handleNext() {
            if (this.ui.radioMode === true) {
                this.skipRadio({
                    id: this.playing.id,
                    time: Math.trunc(this.audioEl.currentTime * 1000)
                });
            }
            this.playNextTrack();
        },
        handleProgressDrag(value) {
            this.audioEl.currentTime = this.timeTotal * value / 100;
        },
        submitListened() {
            if (this.user.loginValid) {
                Api.submitListened(this.playing.id, this.timeTotal, this.playing.source);
            }
        },
        async handleFavorite() {
            if (!this.user.loginValid || !this.playing.id) {
                this.$toast.message('真的这么喜欢我吗 o(*////▽////*)q');
                return;
            }
            if (this.shouldFavorite !== null) return;
            this.shouldFavorite = !this.isFavorite;
            try {
                if (this.ui.radioMode) {
                    await this.likeRadio({
                        id: this.playing.id,
                        time: Math.trunc(this.audioEl.currentTime * 1000),
                        like: this.shouldFavorite
                    });
                } else {
                    this.favoriteTrack({ id: this.playing.id, favorite: this.shouldFavorite });
                }
                // it would take some time for NetEase to update playlist cover
                // img, so we just wait 200 ms
                await new Promise(_ => setTimeout(() => _(), 200));
                await this.updateFavoriteTrackIds();
            } finally {
                this.shouldFavorite = null;
            }
        },
        cancelHideVolume() {
            if (this.volumeHideTimeoutId >= 0) {
                window.clearTimeout(this.volumeHideTimeoutId);
            }
        },
        scheduleHideVolume() {
            this.cancelHideVolume();
            this.volumeHideTimeoutId = setTimeout(() => {
                this.volumeHideTimeoutId = -1;
                this.volumeShown = false;
            }, 750);
        },
        handleVolumeChange(value) {
            let volume = value;
            if (value > 100) {
                volume = 100;
            } else if (volume < 0) {
                volume = 0;
            }
            this.setAudioVolume({ volume });
        },
        handleVolumeWheel(ev) {
            if (this.volumeShown === false) {
                this.volumeShown = true;
            }
            this.scheduleHideVolume();
            if (this.ui.audioMute === true) this.ui.audioMute = false;
            if (ev.deltaY > 0) {
                this.handleVolumeChange(this.ui.audioVolume - 5);
            } else {
                this.handleVolumeChange(this.ui.audioVolume + 5);
            }
        },
        handleVolumeMute() {
            this.setAudioVolume({ mute: !this.ui.audioMute });
        },
        handleLoopMode() {
            if (this.ui.radioMode) {
                this.$toast.message('私人 FM');
                return;
            }
            this.nextLoopMode();
            switch (this.queue.loopMode) {
                case LOOP_MODE.LIST:
                    this.$toast.message('列表顺序播放');
                    break;
                case LOOP_MODE.SINGLE:
                    this.$toast.message('单曲循环');
                    break;
                case LOOP_MODE.RANDOM:
                    this.$toast.message('随机播放');
                    break;
            }
        },
        handleRadioDislike() {
            if (!this.playing.id) {
                this.$toast.message('不跟你玩了，哼  o(￣ヘ￣o＃)');
                return;
            }
            const time = Math.trunc(this.audioEl.currentTime * 1000);
            this.trashRadio({ id: this.playing.id, time });
            this.playNextTrack();
        },
        handleSourceNavigate() {
            this.currentListShown = false;
        }
    },
    computed: {
        ...mapState(['ui', 'user']),
        ...mapGetters(['playing', 'queue']),
        coverImgStyle() {
            if (this.playing.album && this.playing.album.picUrl) {
                return bkgImg(sizeImg(this.playing.album.picUrl, HiDpiPx(64)));
            }
            return '';
        },
        coverIcon() {
            if (this.$route.name === 'player') return 'fullscreen_exit';
            return 'fullscreen';
        },
        songProgress() {
            return 100 * this.timeCurrent / this.timeTotal || 0;
        },
        isFavorite() {
            if (!this.user.loginValid || !this.playing) {
                return false;
            }
            if (this.shouldFavorite !== null) {
                return this.shouldFavorite;
            }
            return this.user.favTrackIds.includes(this.playing.id);
        },
        iconVolume() {
            if (this.ui.audioMute === true || this.ui.audioVolume <= 0) return VolumeIcon[0];
            if (this.ui.audioVolume <= 33) return VolumeIcon[1];
            if (this.ui.audioVolume <= 66) return VolumeIcon[2];
            return VolumeIcon[3];
        },
        iconLoopMode() {
            switch (this.queue.loopMode) {
                case LOOP_MODE.LIST:
                    return 'repeat';
                case LOOP_MODE.SINGLE:
                    return 'repeat_one';
                case LOOP_MODE.RANDOM:
                    return 'shuffle';
            }
            return 'not_interested';
        },
        iconPlayPause() {
            return this.ui.paused ? 'play_arrow' : 'pause';
        }
    },
    filters: {
        time: shortTime
    },
    watch: {
        currentListShown(val) {
            // scroll current playlist to playing item when open
            if (val === true) {
                setTimeout(() => {
                    this.$refs.list.scrollTo(this.queue.index);
                }, 100);
            }
        }
    },
    mounted() {
        /** @type {HTMLAudioElement} */
        const _audioEl = document.getElementById('playerbar-audio');
        let _playingIntervalId;
        this.audioEl = _audioEl;

        if (this.ui.audioMute === true) {
            _audioEl.volume = 0;
        } else {
            _audioEl.volume = this.ui.audioVolume / 100;
        }

        const _updateTime = () => this.timeCurrent = this.audioEl.currentTime;
        const _setUpdateTimeInterval = () => {
            if (_playingIntervalId) {
                clearInterval(_playingIntervalId);
            }
            _playingIntervalId = setInterval(() => _updateTime(), 1000);
        };
        const _unsetUpdateTimeInterval = () => _playingIntervalId = clearInterval(_playingIntervalId);

        _audioEl.addEventListener('loadedmetadata', () => {
            _unsetUpdateTimeInterval();
            this.timeTotal = _audioEl.duration;
            this.timeCurrent = _audioEl.currentTime;
            if (this.ui.paused === false && _audioEl.paused) {
                _audioEl.play();
            }
        });

        // keep audio progress when HMR
        if (process.env.NODE_ENV === 'development') {
            if (_audioEl.readyState >= HTMLMediaElement.HAVE_METADATA) {
                this.timeTotal = _audioEl.duration;
                this.timeCurrent = _audioEl.currentTime;
                if (!this.ui.paused) _setUpdateTimeInterval();
            }
        }

        _audioEl.addEventListener('seeking', _updateTime);

        _audioEl.addEventListener('playing', () => {
            _updateTime();
            // update playing process time after the time reaches a 'integer' second
            // why use 1.15 not 1 ? maybe there is a little lag in event loop... I don't know
            // maybe the value should be different on every device?
            const timeOut = (1.15 - _audioEl.currentTime % 1) * 1000;
            _unsetUpdateTimeInterval();
            setTimeout(() => {
                _updateTime();
                _setUpdateTimeInterval();
            }, timeOut);
        });

        _audioEl.addEventListener('pause', () => {
            _updateTime();
            _unsetUpdateTimeInterval();
        });

        _audioEl.addEventListener('ended', () => {
            _unsetUpdateTimeInterval();
            this.submitListened();
            if (this.queue.loopMode === LOOP_MODE.SINGLE) {
                _audioEl.play();
            } else {
                this.playNextTrack();
            }
        });

        _audioEl.addEventListener('error', () => {
            _unsetUpdateTimeInterval();
            if (!this.playing.id) return;
            if (!this.hasRetried) {
                this.hasRetried = true;
                this.updateUiAudioSrc({ ignoreCache: true });
                return;
            }
            this.hasRetried = false;
            this.$toast.message('这首歌听不了了，换下一首吧   (￣△￣;) ');
            setTimeout(() => this.playNextTrack(), 3000);
        });

        this.$store.subscribe(mutation => {
            switch (mutation.type) {
                case UPDATE_PLAYING_URL:
                    if (!mutation.payload) {
                        _unsetUpdateTimeInterval();
                        this.timeTotal = this.timeCurrent = 0;
                    }
                    break;
                case SET_AUDIO_VOLUME:
                    if (this.ui.audioMute === true) {
                        this.audioEl.volume = 0;
                    } else {
                        this.audioEl.volume = this.ui.audioVolume / 100;
                    }
                    break;
                case SET_AUDIO_PAUSED:
                    mutation.payload === true ? _audioEl.pause() : _audioEl.play();
                    break;
            }
        });

        if (platform() === 'linux') {
            require('@/util/mpris').bindAudioElement(_audioEl);
        }
    },
    components: {
        CurrentPlaylist
    }
};
</script>

<style lang="less">
.player-bar {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
    display: flex;
    user-select: none;
    cursor: default;
    height: 64px;
    position: fixed;
    width: 100%;
    bottom: 0;
    left: 0;
    .cover {
        cursor: pointer;
        display: flex;
        position: relative;
        align-items: center;
        justify-content: center;
        background-color: black;
        .img {
            background-image: url('~assets/img/cover_default.webp');
            background-size: cover;
            width: 64px;
            height: 64px;
            transition: 0.3s opacity;
        }
        .mu-icon {
            opacity: 0;
            transition: 0.3s opacity;
            position: absolute;
        }
        &:hover {
            .img {
                opacity: 0.65;
            }
            .mu-icon {
                opacity: 1;
            }
        }
        &:active {
            .img {
                opacity: 0.3;
            }
        }
    }
    .info {
        font-size: 14px;
        padding: 4px 12px 0 10px;
        flex-grow: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        .desc {
            display: flex;
            justify-content: space-between;
            .name {
                overflow: hidden;
                text-overflow: ellipsis;
                width: calc(100% - 36px * 4);
                span {
                    max-width: 310px;
                    white-space: nowrap;
                }
                .artist {
                    margin-left: 0.5em;
                    font-size: inherit;
                }
            }
            .shortcut {
                width: calc(36px * 4);
                display: flex;
                justify-content: space-between;
                font-size: 0;
            }
        }
        .progress {
            display: flex;
            .mu-slider {
                margin: 0;
            }
            .time {
                width: 110px;
                text-align: right;
            }
        }
    }
    .control {
        width: 170px;
        min-width: 170px;
        padding-right: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .mu-fab-button {
            box-shadow: unset;
        }
    }
}

.playerbar-volume {
    border-radius: 0;
    height: 40px;
    width: 170px;
    top: unset !important;
    left: unset !important;
    right: 164px !important;
    bottom: 72px !important;
    .content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .mu-slider {
            margin: 8px 16px;
            width: 100px;
        }
        .value {
            margin-right: 8px;
        }
    }
}

.playerbar-current-list {
    border-radius: 0; // avoid 'repaint on scroll'
    width: 420px;
    height: 396px;
    font-size: 14px;
    position: fixed;
    top: unset !important;
    left: unset !important;
    right: 8px !important;
    bottom: 72px !important;
}
</style>

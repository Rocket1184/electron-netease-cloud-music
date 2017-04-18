<template>
    <mu-paper class="player-bar-wrapper"
              :zDepth="2">
        <div class="cell">
            <router-link :to='`/player`'>
                <img :src="getImgAt(64)"
                     :srcset="`${getImgAt(80)} 1.25x, ${getImgAt(96)} 1.5x, ${getImgAt(128)} 2x`">
            </router-link>
        </div>
        <div class="cell info">
            <span class="song-name">{{playing.name}}</span>
            <span class="artist-name">{{playing.artist}}</span>
            <div class="quick-actions">
                <mu-icon-button tooltip="喜欢"
                                tooltipPosition="top-center"
                                :iconClass="isFavorite && 'favorite'"
                                :icon="isFavorite? 'favorite' :'favorite_border'" />
                <mu-icon-button tooltip="收藏到歌单"
                                tooltipPosition="top-center"
                                icon="bookmark_border" />
                <mu-icon-menu tooltip="播放列表"
                              tooltipPosition="top-center"
                              icon="playlist_play"
                              :maxHeight="400"
                              :targetOrigin="{ vertical: 'bottom', horizontal: 'left' }">
                    <CurrentList/>
                </mu-icon-menu>
            </div>
            <div class="progress">
                <mu-slider :value="songProgress"
                           @change="handleProgressDrag"
                           class="silder" />
                <span class="text">{{ formatTime(timeCurrent) }} / {{ formatTime(timeTotal) }}</span>
                <audio :src="playing.url"></audio>
            </div>
        </div>
        <div class="cell control">
            <mu-float-button icon="skip_previous"
                             mini
                             class="button"
                             color="#FFF"
                             @click="previousTrack" />
            <mu-float-button :icon="this.audioEl.paused ? 'play_arrow' : 'pause'"
                             class="button"
                             color="#FFF"
                             @click="handlePlayOrPause" />
            <mu-float-button icon="skip_next"
                             mini
                             class="button"
                             color="#FFF"
                             @click="nextTrack" />
        </div>
    </mu-paper>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import CurrentList from '../components/currentlist';
import * as types from '../vuex/mutation-types';

export default {
    data() {
        return {
            audioEl: {},
            timeTotal: 0,
            timeCurrent: 0,
            isFavorite: true,
            fallbackImg: 'http://p3.music.126.net/Dev8qwDRGjIxAtopFG0uxg==/3263350512830591.jpg'
        };
    },
    methods: {
        ...mapActions([
            'nextTrack',
            'previousTrack',
            'restorePlaylist'
        ]),
        getImgAt(size) {
            const url = this.playing.album.picUrl || this.fallbackImg;
            return `${url}?param=${size}y${size}`;
        },
        formatTime(value) {
            const dt = new Date(value * 1000);
            const h = dt.getUTCHours();
            const m = dt.getMinutes();
            const s = dt.getSeconds();
            let res = '';
            h && (res += `${h}:`);
            res += m < 10 ? `0${m}:` : `${m}:`;
            res += s < 10 ? `0${s}` : `${s}`;
            return res;
        },
        play() {
            this.$store.commit(types.RESUME_PLAYING_MUSIC);
            this.audioEl.play();
        },
        pause() {
            this.$store.commit(types.PAUSE_PLAYING_MUSIC);
            this.audioEl.pause();
        },
        handlePlayOrPause() {
            this.playing.url && (this.audioEl.paused ? this.play() : this.pause());
        },
        handleProgressDrag(value) {
            this.audioEl.currentTime = this.timeTotal * value / 100;
        }
    },
    computed: {
        ...mapGetters({
            playlist: 'playlist',
            playing: 'playingMusic'
        }),
        songProgress() {
            return 100 * this.timeCurrent / this.timeTotal || 0;
        }
    },
    created() {
        try {
            const playing = JSON.parse(localStorage.getItem('playing'));
            const playlist = JSON.parse(localStorage.getItem('playlist'));
            this.restorePlaylist({ playing, playlist });
        } catch (e) { }
        window.onbeforeunload = () => {
            this.pause();
            localStorage.setItem('playing', JSON.stringify(this.playing));
            localStorage.setItem('playlist', JSON.stringify(this.playlist));
        };
    },
    mounted() {
        const _audioEl = document.getElementsByTagName('audio')[0];
        const _slider = document.querySelector('.progress .silder');
        let _playingIntervalId;
        this.audioEl = _audioEl;

        const _updateTime = () => this.timeCurrent = this.audioEl.currentTime;
        const _unsetInterval = () => _playingIntervalId = clearInterval(_playingIntervalId);

        _slider.onpointerdown = () => _audioEl.pause();
        _slider.onpointerup = () => this.playing.playing && _audioEl.play();

        _audioEl.ondurationchange = () => {
            _unsetInterval();
            this.timeTotal = _audioEl.duration;
            this.timeCurrent = _audioEl.currentTime = 0;
            if (this.playing.playing) _audioEl.play();
        };

        _audioEl.onseeking = _updateTime;

        _audioEl.onplaying = () => {
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
        };

        _audioEl.onpause = () => _updateTime() && _unsetInterval();

        _audioEl.onended = () => this.nextTrack();
    },
    components: {
        CurrentList
    }
};
</script>

<style lang="less">
.player-bar-wrapper {
    font-size: 0;
    height: 64px;
    .cell {
        min-width: 64px;
        vertical-align: top;
        height: 100%;
        display: inline-block;
    }
    .info {
        position: relative;
        font-size: 14px;
        padding: 10px 14px;
        width: calc(~"100% - 244px");
        .artist-name {
            margin-left: 14px;
            color: dimgrey;
        }
        .quick-actions {
            position: absolute;
            top: -5px;
            right: 0;
            .favorite {
                color: red;
            }
        }
        .progress {
            margin-top: 5px;
            display: flex;
            .silder {
                flex: 1;
            }
            .text {
                margin-left: 10px;
            }
        }
    }
    .control {
        width: 180px;
        padding: 4px;
        .button {
            margin-left: 10px;
            display: inline-block;
            vertical-align: middle;
            box-shadow: transparent 0 0 0;
        }
    }
}
</style>

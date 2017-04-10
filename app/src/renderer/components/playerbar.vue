<template>
    <mu-paper class="player-bar-wrapper"
              :zDepth="2">
        <div class="cell">
            <img :src="getImgAt(64)"
                 :srcset="`${getImgAt(80)} 1.25x, ${getImgAt(96)} 1.5x, ${getImgAt(128)} 2x`">
        </div>
        <div class="cell info">
            <span class="song-name">{{playing.name}}</span>
            <span class="artist-name">{{playing.artist}}</span>
            <div class="quick-actions">
                <mu-icon-button tooltip="喜欢"
                                tooltipPosition="top-center"
                                touch
                                :iconClass="isFavorite && 'favorite'"
                                :icon="isFavorite? 'favorite' :'favorite_border'" />
                <mu-icon-button tooltip="收藏到歌单"
                                tooltipPosition="top-center"
                                touch
                                icon="bookmark_border" />
                <mu-icon-button tooltip="查看播放列表"
                                tooltipPosition="top-center"
                                touch
                                icon="playlist_play" />
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
                             color="#FFF" />
            <mu-float-button :icon="this.playing.playing ? 'pause' : 'play_arrow'"
                             class="button"
                             color="#FFF"
                             @click="handlePlayOrPause()" />
            <mu-float-button icon="skip_next"
                             mini
                             class="button"
                             color="#FFF" />
        </div>
    </mu-paper>
</template>

<script>
import { mapGetters } from 'vuex';

import ApiRenderer from '../util/apirenderer';
import * as types from '../vuex/mutation-types';

export default {
    data() {
        return {
            audioEl: {},
            timeTotal: 0,
            timeCurrent: 0,
            isFavorite: true
        };
    },
    async created() {
        let oUrl = await ApiRenderer.getMusicUrl(30830838);
        this.$store.commit({
            ...oUrl.data[0],
            type: types.SET_PLAYING_MUSIC,
        });
    },
    mounted() {
        const _updateTime = () => this.timeCurrent = this.audioEl.currentTime;
        const _audioEl = document.getElementsByTagName('audio')[0];
        let _playingIntervalId;
        this.audioEl = _audioEl;
        _audioEl.ondurationchange = () => {
            this.timeTotal = _audioEl.duration;
            this.timeCurrent = _audioEl.currentTime;
        };
        _audioEl.onseeked = () => {
            this.playing.playing && _audioEl.play();
            _updateTime();
        };
        _audioEl.onseeking = () => {
            !_audioEl.paused && _audioEl.pause();
            _updateTime();
        };
        _audioEl.onplaying = () => {
            _updateTime();
            _playingIntervalId = setInterval(() => _updateTime(), 17);
        };
        _audioEl.onpause = () => {
            _updateTime();
            clearInterval(_playingIntervalId);
        };
    },
    methods: {
        getImgAt(size) {
            return `${this.playing.url}?param=${size}y${size}`;
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
            this.playing.playing ? this.pause() : this.play();
        },
        handleProgressDrag(value) {
            this.audioEl.currentTime = this.timeTotal * value / 100;
        }
    },
    computed: {
        ...mapGetters({
            playing: 'playingMusic'
        }),
        songProgress() {
            return 100 * this.timeCurrent / this.timeTotal || 0;
        }
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
        padding: 10px;
        width: calc(~"100% - 244px");
        .artist-name {
            margin-left: 14px;
            color: dimgrey;
        }
        .quick-actions {
            position: absolute;
            top: 0;
            right: 0;
            .favorite {
                color: red;
            }
        }
        .progress {
            padding-top: 4px;
            display: flex;
            .silder {
                flex: 100;
                flex-grow: 1;
            }
            .text {
                flex: 1;
                max-width: 120px;
                padding-left: 10px;
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

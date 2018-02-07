<template>
    <mu-paper class="player-bar-wrapper"
        :zDepth="2">
        <div class="cell">
            <router-link to='/player'>
                <img :src="getImgAt(64)"
                    :srcset="`${getImgAt(80)} 1.25x, ${getImgAt(96)} 1.5x, ${getImgAt(128)} 2x`">
            </router-link>
        </div>
        <div class="cell info">
            <span class="song-name">{{playing.track.name}}</span>
            <span class="artist-name">{{playing.track.artistName}}</span>
            <div class="quick-actions">
                <mu-icon-button title="喜欢"
                    :iconClass="{ favorite: isFavorite }"
                    :icon="isFavorite ? 'favorite' :'favorite_border'"
                    @click="handleFavorite"></mu-icon-button>
                <mu-checkbox title="收藏到歌单"
                    class="action-item"
                    uncheckIcon="bookmark_border"
                    checkedIcon="bookmark"
                    v-model="userPlaylistsShown"></mu-checkbox>
                <mu-checkbox title="播放列表"
                    class="action-item"
                    uncheckIcon="queue_music"
                    checkedIcon="queue_music"
                    v-model="currentListShown"></mu-checkbox>
            </div>
            <div class="progress">
                <mu-slider id="playerbar-progress"
                    class="slider"
                    :value="songProgress"
                    @change="handleProgressDrag"></mu-slider>
                <span class="text">{{ timeCurrent | time }} / {{ timeTotal | time }}</span>
            </div>
        </div>
        <div class="cell control">
            <mu-float-button icon="skip_previous"
                mini
                class="button"
                color="#FFF"
                @click="playPreviousTrack"></mu-float-button>
            <mu-float-button :icon="this.audioEl.paused ? 'play_arrow' : 'pause'"
                class="button"
                color="#FFF"
                @click="handlePlayOrPause"></mu-float-button>
            <mu-float-button icon="skip_next"
                mini
                class="button"
                color="#FFF"
                @click="playNextTrack"></mu-float-button>
        </div>
        <mu-popup position="bottom"
            :open="userPlaylistsShown"
            @close="userPlaylistsShown=false">
            <mu-appbar title="收藏到歌单">
                <mu-icon-button slot="right"
                    icon="close"
                    color="white"
                    @click="userPlaylistsShown=false"></mu-icon-button>
            </mu-appbar>
            <userPlaylists @rowClick="handleCollect"></userPlaylists>
        </mu-popup>
        <transition name="list-open-up">
            <!-- TODO: Click outside to close the list -->
            <currentList v-show="currentListShown"></currentList>
        </transition>
    </mu-paper>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import ApiRenderer from 'util/apiRenderer';
import currentList from './currentList.vue';
import userPlaylists from './userPlaylists.vue';
import * as types from '../vuex/mutation-types';
import { getImgSizeOf } from 'util/image';
import { shortTime } from 'util/formatter';

export default {
    data() {
        return {
            audioEl: {},
            timeTotal: 0,
            timeCurrent: 0,
            fallbackImg: 'http://p3.music.126.net/Dev8qwDRGjIxAtopFG0uxg==/3263350512830591.jpg',
            userPlaylistsShown: false,
            currentListShown: false
        };
    },
    methods: {
        ...mapActions([
            'playNextTrack',
            'playPreviousTrack',
            'restorePlaylist',
            'refreshUserPlaylist'
        ]),
        getImgAt(size) {
            const url = this.playing.track.album.picUrl || this.fallbackImg;
            return getImgSizeOf(url, size);
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
        },
        submitListened() {
            ApiRenderer.submitListened(this.playing.track.id, this.timeTotal);
        },
        async handleFavorite() {
            const listId = this.user.favoriteList.id;
            const trackId = this.playing.track.id;
            if (this.isFavorite) {
                await ApiRenderer.uncollectTrack(listId, trackId);
            } else {
                await ApiRenderer.collectTrack(listId, trackId);
            }
            // it would take some time for NetEase to update playlist cover
            // img, so we just wait 200 ms
            setTimeout(() => this.refreshUserPlaylist(listId), 200);
        },
        async handleCollect(list) {
            const resp = await ApiRenderer.collectTrack(list.id, this.playing.track.id);
            if (resp.code === 200) {
                this.$toast('成功添加到歌单     (๑•̀ㅂ•́)و✧');
                // same to above
                setTimeout(() => this.refreshUserPlaylist(list.id), 200);
            } else if (resp.code === 502) {
                this.$toast('歌曲已存在        ¯\\_(ツ)_/¯');
            } else {
                this.$toast(`失败了 ∑(っ °Д °;)っ 错误代码 ${resp.code}`);
            }
        }
    },
    computed: {
        ...mapGetters([
            'playlist',
            'playing',
            'user'
        ]),
        isFavorite() {
            const { favoriteList } = this.user;
            if (favoriteList) {
                const track = favoriteList.tracks.filter(t => t.id === this.playing.track.id).pop();
                return typeof track === 'object';
            }
            return false;
        },
        songProgress() {
            return 100 * this.timeCurrent / this.timeTotal || 0;
        }
    },
    filters: {
        time: shortTime
    },
    async created() {
        window.onbeforeunload = () => {
            if (!this.$store.state.settings.autoPlay) this.pause();
            localStorage.setItem('playlist', JSON.stringify(this.playlist));
        };
        try {
            const stored = localStorage.getItem('playlist');
            if (stored) {
                const playlist = JSON.parse(stored);
                await this.restorePlaylist({ playlist });
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.info('Playlist stored in localStorage not valid.');
        }
    },
    mounted() {
        const _audioEl = document.getElementById('playerbar-audio');
        const _slider = document.getElementById('playerbar-progress');
        let _playingIntervalId;
        this.audioEl = _audioEl;

        const _updateTime = () => this.timeCurrent = this.audioEl.currentTime;
        const _unsetInterval = () => _playingIntervalId = clearInterval(_playingIntervalId);

        _slider.onpointerdown = () => _audioEl.pause();
        _slider.onpointerup = () => !this.playing.paused && _audioEl.play();

        _audioEl.ondurationchange = () => {
            _unsetInterval();
            this.timeTotal = _audioEl.duration;
            this.timeCurrent = _audioEl.currentTime = 0;
            if (!this.playing.paused) _audioEl.play();
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

        _audioEl.onended = () => {
            this.submitListened();
            this.playNextTrack();
        };
    },
    components: {
        currentList,
        userPlaylists
    }
};
</script>

<style lang="less">
.player-bar-wrapper {
    font-size: 0;
    height: 64px;
    position: relative;
    .cell {
        min-width: 64px;
        vertical-align: top;
        height: 100%;
        display: inline-block;
    }
    .info {
        font-size: 14px;
        padding: 10px 14px;
        width: calc(~'100% - 244px');
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
            i {
                transition: color 0.5s;
            }
            .favorite {
                color: red;
            }
            .action-item {
                margin: 12px 12px 0 0;
            }
        }
        .progress {
            position: relative;
            .slider {
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
        .button {
            margin-left: 10px;
            display: inline-block;
            vertical-align: middle;
            box-shadow: transparent 0 0 0;
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

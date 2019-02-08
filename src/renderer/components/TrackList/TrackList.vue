<template>
    <div class="tracklist">
        <template v-if="tracks.length !== 0">
            <div class="list">
                <TrackItem v-for="(track, index) in tracks"
                    :key="track.id"
                    :index="1 + index + indexOffset"
                    :track="track"
                    :shortcuts="shortcuts"
                    @dblclick="handlePlay(index)"
                    @collect="handleCollect(track.id)"
                    @queue="handleQueue(index)"></TrackItem>
            </div>
        </template>
        <CenteredTip v-else
            icon="inbox"
            tip="没有歌曲  (ÒωÓױ)"></CenteredTip>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import TrackItem from './TrackItem.vue';
import CenteredTip from '@/components/CenteredTip.vue';

const shortcuts = [
    {
        event: 'collect',
        icon: 'bookmark_border',
        title: '收藏到歌单'
    },
    {
        event: 'queue',
        icon: 'playlist_add',
        title: '添加到播放列表'
    }
];

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
        }
    },
    computed: {
        ...mapState(['ui', 'user', 'playlist']),
        ...mapGetters(['queue']),
        shortcuts() {
            return shortcuts;
        }
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
        queueTrack(index) {
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
        handleQueue(index) {
            if (this.ui.radioMode) {
                this.$toast.message('正在播放私人 FM，无法添加到播放列表');
                return;
            }
            this.queueTrack(index);
        },
        playTrack(index) {
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
        },
        handlePlay(index) {
            if (this.ui.radioMode === true) {
                this.$toast.message('已退出私人 FM');
                this.activateRadio(false);
            }
            this.playTrack(index);
        }
    },
    components: {
        TrackItem,
        CenteredTip
    }
};
</script>

<style lang="less">
.tracklist {
    width: 100%;
    user-select: none;
    .centered-tip {
        height: 220px;
    }
}
</style>

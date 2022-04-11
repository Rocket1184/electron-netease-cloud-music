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
import { mapActions } from 'vuex';

import TrackItem from './TrackItem.vue';
import CenteredTip from '@/components/CenteredTip.vue';

/** @typedef {{ event: string, icon: string, title: string }} TrackListShortcut */

/** @type {TrackListShortcut[]} */
const shortcuts = [
    {
        event: 'collect',
        icon: 'bookmark_border',
        title: '收藏到歌单'
    },
    {
        event: 'queue',
        icon: 'playlist_add',
        title: '下一首播放'
    }
];

export default {
    props: {
        /** @type {Vue.PropType<Models.Track[]>} */
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
        /** @returns {import('@/store/modules/ui').State} */
        ui() { return this.$store.state.ui; },
        /** @returns {import('@/store/modules/user').State} */
        user() { return this.$store.state.user; },
        /** @returns {import('@/store/modules/playlist').State} */
        playlist() { return this.$store.state.playlist; },
        /** @returns {import('@/store/modules/settings').State} */
        settings() { return this.$store.state.settings; },
        /** @returns {{ index: number, loopMode: number, list: Models.Track[] }} */
        queue() { return this.$store.getters.queue; },
        /** @returns {TrackListShortcut[]} */
        shortcuts() {
            return shortcuts;
        },
        /** @returns {Models.Track[]} */
        trackDetails() {
            return this.tracks;
        },
    },
    methods: {
        ...mapActions([
            'activateRadio',
            'playTrackIndex',
            'toggleCollectPopup',
            'insertTrackIntoPlaylist',
            'playPlaylist'
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
         * @param {number} index track index in `this.trackDetails`
         * @returns {number}
         */
        findTrackInPlaylist(index) {
            const track = this.trackDetails[index];
            return this.playlist.list.findIndex(t => t.id === track.id);
        },
        queueTrack(index) {
            if (this.findTrackInPlaylist(index) > -1) {
                // track exists in playlist
                this.$toast.message('已经在播放列表中了  ( >﹏<。)～');
                return;
            }
            this.insertTrackIntoPlaylist({
                tracks: [this.trackDetails[index]],
                source: this.source,
                index: this.playlist.index + 1
            });
            this.$toast.message('已添加下一首播放  _(:з」∠)_');
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
                tracks: [this.trackDetails[index]],
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
            if (this.settings.autoReplacePlaylist) {
                this.playPlaylist({ tracks: this.trackDetails, source: this.source, firstIndex: index });
            } else {
                this.playTrack(index);
            }
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
    .centered-tip,
    .centered-loading {
        height: 220px;
    }
}
</style>

<template>
    <component ref="detailCompo"
        :is="compo"
        v-bind="bindProp"></component>
</template>

<script>
import { mapActions } from 'vuex';
import { SET_AUDIO_PAUSED } from '@/store/mutation-types';

import MV from './MV.vue';
import Video from './Video.vue';

export default {
    props: {
        video: {
            required: true
        }
    },
    computed: {
        compo() {
            return this.video.type === 0 ? MV : Video;
        },
        bindProp() {
            return this.video.type === 0 ? { mv: this.video } : { video: this.video };
        }
    },
    methods: {
        ...mapActions([
            'pauseAudio'
        ]),
        /**
         * @param {MouseEvent} e
         */
        toggleMute(e) {
            /** @type {HTMLVideoElement} */
            const v = e.target;
            v.muted = !v.muted;
        },
        onVideoPlay() {
            this.pauseAudio();
        },
        /**
         * @param {MouseEvent} e
         */
        onMouseWheel(e) {
            /** @type {HTMLVideoElement} */
            const vid = e.target;
            let volume = vid.volume;
            if (e.deltaY > 0) {
                volume -= 0.05;
                if (volume < 0) volume = 0;
            } else {
                volume += 0.05;
                if (volume > 1) volume = 1;
            }
            vid.volume = volume;
        }
    },
    mounted() {
        /** @type {HTMLVideoElement} */
        const vid = this.$refs.detailCompo.$refs.videoEl;
        this._vid = vid;
        // audio play pauses video
        this._unsub = this.$store.subscribe(({ type, payload }) => {
            if (type === SET_AUDIO_PAUSED && payload === false) {
                if (!vid.paused) {
                    vid.pause();
                }
            }
        });
        // video play pauses audio
        vid.addEventListener('play', this.onVideoPlay);
        vid.addEventListener('auxclick', this.toggleMute);
        vid.addEventListener('wheel', this.onMouseWheel, { passive: true });
    },
    beforeDestroy() {
        this._unsub();
        this._vid.removeEventListener('play', this.onVideoPlay);
        this._vid.removeEventListener('auxclick', this.toggleMute);
        this._vid.removeEventListener('wheel', this.onMouseWheel);
        this._vid = null;
    }
};
</script>

<style lang="less">
.video-detail {
    margin: 0 16px;
    display: flex;
    flex-direction: column;
    .desc {
        margin: 8px 0;
        .title {
            font-size: 20px;
        }
        .by,
        .creator {
            margin-left: 8px;
            font-size: 14px;
        }
        .creator:hover {
            text-decoration: underline;
        }
    }
    video {
        max-width: 100%;
        object-fit: contain;
    }
    .actions {
        margin: 8px 0;
        display: flex;
    }
}
</style>

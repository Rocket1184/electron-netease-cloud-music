<template>
    <component ref="detailCompo"
        :is="compoName"
        v-bind="bindProp"></component>
</template>

<script>
import MV from './MV.vue';
import Video from './Video.vue';

export default {
    props: {
        video: {
            required: true
        }
    },
    computed: {
        compoName() {
            if (this.video.type === 0) return 'MV';
            return 'Video';
        },
        bindProp() {
            if (this.video.type === 0) return { mv: this.video };
            return { video: this.video };
        }
    },
    methods: {
        togglePlayPause() {
            const vid = this.$refs.detailCompo.$refs.videoEl;
            if (vid) vid.paused ? vid.play() : vid.pause();
        },
        /**
         * @param {KeyboardEvent} ev
         */
        handlePlayPause(ev) {
            if (ev.keyCode === 32 /* space */) {
                this.togglePlayPause();
            }
        }
    },
    mounted() {
        /** @type {HTMLVideoElement} */
        const vid = this.$refs.detailCompo.$refs.videoEl;
        vid.addEventListener('click', () => vid.paused ? vid.play() : vid.pause());
        vid.addEventListener('auxclick', () => vid.muted = !vid.muted);
        vid.addEventListener('wheel', ev => {
            let volume = vid.volume;
            if (ev.deltaY > 0) {
                volume -= 0.05;
                if (volume < 0) volume = 0;
            } else {
                volume += 0.05;
                if (volume > 1) volume = 1;
            }
            vid.volume = volume;
        });
        document.addEventListener('keydown', this.handlePlayPause);
    },
    activated() {
        document.addEventListener('keydown', this.handlePlayPause);
    },
    deactivated() {
        document.removeEventListener('keydown', this.handlePlayPause);
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.handlePlayPause);
    },
    components: {
        MV,
        Video
    }
};
</script>

<style lang="less">
.video-detail {
    padding: 0 16px;
    width: 100%;
    display: flex;
    flex-direction: column;
    .desc {
        margin: 8px 0;
        .title {
            font-size: 20px;
        }
        .by,
        .creator {
            padding-left: 8px;
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

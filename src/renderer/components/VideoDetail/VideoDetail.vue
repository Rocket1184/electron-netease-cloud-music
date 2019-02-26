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

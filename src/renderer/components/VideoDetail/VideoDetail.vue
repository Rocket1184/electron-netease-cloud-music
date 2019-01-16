<template>
    <div class="video-detail">
        <MV v-if="video.type === 0"
            :mv="video"></MV>
        <Video v-else
            :video="video"></Video>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import MV from './MV.vue';
import Video from './Video.vue';

export default {
    props: {
        video: {
            required: true
        }
    },
    data() {
        return {
            audioPlaying: true,
            videoPlayed: false
        };
    },
    computed: {
        ...mapState(['ui'])
    },
    methods: {
        ...mapActions([
            'playAudio',
            'pauseAudio'
        ])
    },
    created() {
        this.audioPlaying = !this.ui.paused;
    },
    mounted() {
        const elm = document.querySelector('video');
        elm.addEventListener('playing', () => {
            if (!this.videoPlayed) {
                this.videoPlayed = true;
                if (this.audioPlaying) {
                    this.pauseAudio();
                }
            }
        });
    },
    beforeDestroy() {
        if (this.audioPlaying) {
            this.playAudio();
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
    .v-wrapper {
        width: 720px;
        margin: auto;
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
        .video {
            video {
                height: 405px;
                width: 720px;
                object-fit: cover;
            }
        }
    }
}
</style>

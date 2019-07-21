<template>
    <ListDetailLayout class="ncm-page"
        showBack
        :detailLoading="detailLoading">
        <VideoDetail :video="video"></VideoDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { getVideoDetail } from '@/api/typed';

import ListDetailLayout from '@/components/ListDetailLayout.vue';
import VideoDetail from '@/components/VideoDetail/VideoDetail.vue';

export default {
    props: {
        id: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            video: null,
            detailLoading: true,
            pausedWhenEnter: null
        };
    },
    computed: {
        ...mapState(['ui'])
    },
    methods: {
        ...mapActions([
            'pauseAudio',
            'playAudio'
        ]),
        async loadVideo() {
            this.detailLoading = true;
            this.video = await getVideoDetail(this.id, Number(this.id.toString().length >= 30));
            this.detailLoading = false;
            this.$nextTick(() => {
                this.$el.querySelector('video').onplay = () => {
                    if (!this.ui.paused) this.pauseAudio();
                };
            });
        }
    },
    mounted() {
        this.pausedWhenEnter = this.ui.paused;
        this.loadVideo();
    },
    beforeDestroy() {
        if (!this.pausedWhenEnter) {
            this.playAudio();
        }
        this.pausedWhenEnter = null;
    },
    beforeRouteUpdate(to, from, next) {
        // this component is reused in the new route
        next();
        this.$nextTick(() => this.loadVideo());
    },
    components: {
        ListDetailLayout,
        VideoDetail
    }
};
</script>

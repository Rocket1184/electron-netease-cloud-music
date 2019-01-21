<template>
    <ListDetailLayout :detailLoading="detailLoading">
        <div slot="list">
            <mu-list>
                <ListItemBack></ListItemBack>
            </mu-list>
        </div>
        <VideoDetail slot="detail"
            v-if="!detailLoading"
            :video="ui.temp.video"></VideoDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import ListItemBack from '@/components/ListItemBack.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';
import VideoDetail from '@/components/VideoDetail/VideoDetail.vue';

export default {
    computed: {
        ...mapState(['ui'])
    },
    data() {
        return {
            detailLoading: true,
            pausedWhenEnter: null
        };
    },
    methods: {
        ...mapActions([
            'setUiTempVideo',
            'pauseAudio',
            'playAudio'
        ]),
        async loadVideo() {
            const id = this.$route.params.id;
            if (!this.ui.temp.video || this.ui.temp.video.id != id) {
                this.detailLoading = true;
                await this.setUiTempVideo({ id, type: Number(id.length >= 30) });
            }
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
        this.loadVideo();
    },
    components: {
        ListItemBack,
        ListDetailLayout,
        VideoDetail
    }
};
</script>

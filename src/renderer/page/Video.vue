<template>
    <ListDetailLayout class="ncm-page"
        showBack
        :detailLoading="detailLoading">
        <VideoDetail :video="video"></VideoDetail>
    </ListDetailLayout>
</template>

<script>
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
            detailLoading: true
        };
    },
    methods: {
        async loadVideo() {
            this.detailLoading = true;
            this.video = await getVideoDetail(this.id, Number(this.id.toString().length >= 30));
            this.detailLoading = false;
        }
    },
    mounted() {
        this.loadVideo();
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

<template>
    <ListDetailLayout :detailLoading="detailLoading">
        <div slot="list">
            <mu-list>
                <ListItemBack></ListItemBack>
            </mu-list>
        </div>
        <VideoDetail slot="detail"
            v-if="ui.temp.video"
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
            detailLoading: true
        };
    },
    methods: {
        ...mapActions([
            'setUiTempVideo'
        ]),
        async loadVideo(id) {
            this.detailLoading = true;
            await this.setUiTempVideo({ id, type: Number(id.length >= 30) });
            this.detailLoading = false;
        }
    },
    mounted() {
        const id = this.$route.params.id;
        this.loadVideo(id);
    },
    beforeRouteUpdate(to, from, next) {
        // this component is reused in the new route
        next();
        const id = this.$route.params.id;
        this.loadVideo(id);
    },
    components: {
        ListItemBack,
        ListDetailLayout,
        VideoDetail
    }
};
</script>

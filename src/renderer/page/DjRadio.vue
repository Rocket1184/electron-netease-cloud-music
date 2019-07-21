<template>
    <ListDetailLayout class="ncm-page playlist-detail djradio-detail"
        showBack
        :detailLoading="detailLoading">
        <DjRadioDetail :djradio="djradio"></DjRadioDetail>
    </ListDetailLayout>
</template>

<script>
import { getDjRadioDetail } from '@/api/typed';

import DjRadioDetail from '../components/DjRadioDetail/DjRadioDetail.vue';
import ListDetailLayout from '../components/ListDetailLayout.vue';

export default {
    props: {
        id: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            djradio: null,
            detailLoading: true
        };
    },
    methods: {
        async loadDjRadio() {
            this.detailLoading = true;
            this.djradio = await getDjRadioDetail(this.id);
            this.detailLoading = false;
        }
    },
    mounted() {
        this.loadDjRadio();
    },
    beforeRouteUpdate(to, from, next) {
        // this component is reused in the new route
        next();
        this.$nextTick(() => this.loadDjRadio());
    },
    components: {
        DjRadioDetail,
        ListDetailLayout
    }
};
</script>

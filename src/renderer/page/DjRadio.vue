<template>
    <ListDetailLayout class="ncm-page playlist-detail djradio-detail"
        showBack
        :detailLoading="detailLoading">
        <DjRadioDetail :djradio="djradio"></DjRadioDetail>
    </ListDetailLayout>
</template>

<script>
import Api from '@/api/ipc';

import DjRadioDetail from '../components/DjRadioDetail/DjRadioDetail.vue';
import ListDetailLayout from '../components/ListDetailLayout.vue';

export default {
    data() {
        return {
            djradio: null,
            detailLoading: true
        };
    },
    methods: {
        loadDjRadio() {
            const id = this.$route.params.id;
            this.detailLoading = true;
            Api.getDjRadioDetail(id).then(resp => {
                if (resp.code === 200) {
                    this.djradio = resp.data;
                }
                this.detailLoading = false;
            });
        }
    },
    mounted() {
        this.loadDjRadio();
    },
    beforeRouteUpdate(to, from, next) {
        // this component is reused in the new route
        next();
        this.loadDjRadio();
    },
    components: {
        DjRadioDetail,
        ListDetailLayout
    }
};
</script>

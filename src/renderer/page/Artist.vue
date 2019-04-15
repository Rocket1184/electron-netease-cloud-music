<template>
    <ListDetailLayout class="ncm-page"
        showBack
        :detailLoading="detailLoading">
        <ArtistDetail :artist="ui.temp.artist"></ArtistDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import ArtistDetail from '@/components/ArtistDetail/ArtistDetail.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

export default {
    data() {
        return {
            detailLoading: true
        };
    },
    computed: {
        ...mapState(['ui'])
    },
    methods: {
        ...mapActions([
            'setUiTempArtist'
        ]),
        async loadArtist() {
            const id = this.$route.params.id;
            if (!this.ui.temp.artist.detail || this.ui.temp.artist.detail.id != id) {
                this.detailLoading = true;
                await this.setUiTempArtist(id);
            }
            this.detailLoading = false;
        }
    },
    mounted() {
        this.loadArtist();
    },
    beforeRouteUpdate(to, from, next) {
        // this component is reused in the new route
        next();
        this.loadArtist();
    },
    components: {
        ArtistDetail,
        ListDetailLayout
    }
};
</script>

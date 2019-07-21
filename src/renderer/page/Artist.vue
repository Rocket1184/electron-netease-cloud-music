<template>
    <ListDetailLayout class="ncm-page"
        showBack
        :detailLoading="detailLoading">
        <ArtistDetail :artist="artist"></ArtistDetail>
    </ListDetailLayout>
</template>

<script>
import { getArtistDetail } from '@/api/typed';

import ArtistDetail from '@/components/ArtistDetail/ArtistDetail.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

export default {
    props: {
        id: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            artist: null,
            detailLoading: true
        };
    },
    methods: {
        async loadArtist() {
            this.detailLoading = true;
            this.artist = await getArtistDetail(this.id);
            this.detailLoading = false;
        }
    },
    mounted() {
        this.loadArtist();
    },
    beforeRouteUpdate(to, from, next) {
        // this component is reused in the new route
        next();
        this.nextTick(() => this.loadArtist());
    },
    components: {
        ArtistDetail,
        ListDetailLayout
    }
};
</script>

<template>
    <ListDetailLayout class="ncm-page"
        showBack
        :detailLoading="detailLoading">
        <CenteredTip v-if="!artist"
            icon="person_outline"
            tip="查无此人 ..."></CenteredTip>
        <ArtistDetail v-else
            :artist="artist"></ArtistDetail>
    </ListDetailLayout>
</template>

<script>
import { getArtistDetail } from '@/api/typed';

import ArtistDetail from '@/components/ArtistDetail/ArtistDetail.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';
import CenteredTip from '@/components/CenteredTip.vue';

export default {
    props: {
        id: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            /** @type {{ artist: Models.Artist, hotSongs: Models.Track[] }} */
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
        this.$nextTick(() => this.loadArtist());
    },
    components: {
        ArtistDetail,
        ListDetailLayout,
        CenteredTip
    }
};
</script>

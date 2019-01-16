<template>
    <ListDetailLayout :detailLoading="detailLoading">
        <div slot="list">
            <mu-list>
                <ListItemBack></ListItemBack>
            </mu-list>
        </div>
        <ArtistDetail slot="detail"
            v-if="ui.temp.artist.detail"
            :artist="ui.temp.artist"></ArtistDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import ArtistDetail from '@/components/ArtistDetail/ArtistDetail.vue';
import ListItemBack from '@/components/ListItemBack.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

export default {
    data() {
        return {
            detailLoading: false,
            relatedLoading: false
        };
    },
    computed: {
        ...mapState(['ui'])
    },
    methods: {
        ...mapActions([
            'setUiTempArtist'
        ]),
        async loadArtist(id) {
            this.detailLoading = true;
            await this.setUiTempArtist(id);
            this.detailLoading = false;
        }
    },
    mounted() {
        const id = this.$route.params.id;
        this.loadArtist(id);
    },
    beforeRouteUpdate(to, from, next) {
        // this component is reused in the new route
        next();
        const id = this.$route.params.id;
        this.loadArtist(id);
    },
    components: {
        ArtistDetail,
        ListItemBack,
        ListDetailLayout
    }
};
</script>

<style lang="less">
</style>

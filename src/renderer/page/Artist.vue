<template>
    <ListDetailLayout class="ncm-page"
        :detailLoading="detailLoading">
        <div slot="list">
            <mu-list>
                <ListItemBack></ListItemBack>
            </mu-list>
        </div>
        <ArtistDetail slot="detail"
            v-if="!detailLoading"
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
        ListItemBack,
        ListDetailLayout
    }
};
</script>

<style lang="less">
</style>

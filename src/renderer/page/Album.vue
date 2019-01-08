<template>
    <ListDetailLayout :loading="loading"
        tipText=""
        :showTip="false">
        <div slot="list"
            class="playlist-side">
            <mu-list>
                <ListItemBack></ListItemBack>
            </mu-list>
            <div class="related">
                <mu-list>
                    <mu-list-item>TA 的其他热门专辑</mu-list-item>
                    <div v-if="relatedLoading"
                        class="progress-wrapper">
                        <mu-circular-progress color="secondary"
                            :size="60"
                            :stroke-width="5"></mu-circular-progress>
                    </div>
                    <AvatarListItem v-else
                        v-for="al in ui.temp.relatedAlbums"
                        :key="al.id"
                        :img="al.picUrl"
                        :title="al.name"
                        :subTitle="al.publishDate"
                        @click="handleRelatedClick(al.id)"></AvatarListItem>
                </mu-list>
            </div>
        </div>
        <AlbumDetail slot="detail"
            v-if="ui.temp.album"
            :album="ui.temp.album"></AlbumDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import AlbumDetail from '@/components/AlbumDetail.vue';
import ListItemBack from '@/components/ListItemBack.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

export default {
    data() {
        return {
            loading: false,
            relatedLoading: false
        };
    },
    computed: {
        ...mapState(['ui', 'user']),
    },
    methods: {
        ...mapActions([
            'setUiTempAlbum',
            'setUiRelatedAlbums'
        ]),
        loadAlbum(id) {
            this.loading = true;
            this.relatedLoading = true;
            this.setUiTempAlbum(id)
                .then(() => this.loading = false);
            this.setUiRelatedAlbums(id)
                .then(() => this.relatedLoading = false);
        },
        handleRelatedClick(id) {
            this.$router.push({ name: 'album', params: { id } });
        }
    },
    mounted() {
        const id = this.$route.params.id;
        if (id) {
            this.loadAlbum(id);
        }
    },
    beforeRouteUpdate(to, from, next) {
        // this component is reused in the new route
        next();
        const id = this.$route.params.id;
        this.loadAlbum(id);
    },
    components: {
        AlbumDetail,
        ListItemBack,
        AvatarListItem,
        ListDetailLayout
    }
};
</script>

<template>
    <ListDetailLayout class="ncm-page playlist-detail album-detail"
        showBack
        :detailLoading="detailLoading">
        <template #list>
            <mu-list class="related">
                <mu-list-item>其他热门专辑</mu-list-item>
                <div v-if="relatedLoading"
                    class="progress-wrapper">
                    <mu-circular-progress color="secondary"
                        :size="60"
                        :stroke-width="5"></mu-circular-progress>
                </div>
                <AvatarListItem v-else
                    v-for="al in related"
                    :key="al.id"
                    :img="al.picUrl"
                    :title="al.name"
                    :subTitle="al.publishDate"
                    @click="handleRelatedClick(al.id)"></AvatarListItem>
            </mu-list>
        </template>
        <AlbumDetail :album="album"></AlbumDetail>
    </ListDetailLayout>
</template>

<script>
import Api from '@/api/ipc';
import { getAlbumDetail } from '@/api/typed';

import AlbumDetail from '@/components/AlbumDetail.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
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
            /** @type {Models.Album} */
            album: null,
            /** @type {Types.RelatedAlbum[]} */
            related: [],
            detailLoading: true,
            relatedLoading: true
        };
    },
    methods: {
        loadAlbum() {
            this.detailLoading = true;
            this.relatedLoading = true;
            getAlbumDetail(this.id).then(res => {
                this.album = res;
                this.detailLoading = false;
            });
            Api.getRelatedAlbums(this.id).then(res => {
                this.related = res.data;
                this.relatedLoading = false;
            });
        },
        handleRelatedClick(id) {
            this.$router.push({ name: 'album', params: { id } });
        }
    },
    mounted() {
        this.loadAlbum();
    },
    beforeRouteUpdate(to, from, next) {
        // this component is reused in the new route
        next();
        this.$nextTick(() => this.loadAlbum());
    },
    components: {
        AlbumDetail,
        AvatarListItem,
        ListDetailLayout
    }
};
</script>

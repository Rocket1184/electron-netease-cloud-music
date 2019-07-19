<template>
    <ListDetailLayout class="ncm-page playlist-detail album-detail"
        showBack
        :detailLoading="detailLoading">
        <template #list>
            <mu-list class="related">
                <mu-list-item>TA 的其他热门专辑</mu-list-item>
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
import { Album } from '@/util/models';

import AlbumDetail from '@/components/AlbumDetail.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

export default {
    props: {
        id: {
            type: [Number , String],
            required: true
        }
    },
    data() {
        return {
            album: null,
            related: [],
            detailLoading: true,
            relatedLoading: true
        };
    },
    methods: {
        loadAlbum() {
            const id = this.id;
            this.detailLoading = true;
            this.relatedLoading = true;
            Api.getAlbumDetailW(id).then(res => {
                res.album.songs = res.songs;
                this.album = new Album(res.album);
                this.detailLoading = false;
            });
            Api.getRelatedAlbums(id).then(res => {
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
        this.loadAlbum();
    },
    components: {
        AlbumDetail,
        AvatarListItem,
        ListDetailLayout
    }
};
</script>

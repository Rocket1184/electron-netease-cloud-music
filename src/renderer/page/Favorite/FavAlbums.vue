<template>
    <ListDetailLayout class="fav-album"
        :listLoading="listLoading"
        :detailLoading="detailLoading"
        tipText="登录后查看收藏的专辑"
        :showTip="!user.loginValid">
        <template #list>
            <mu-list>
                <AvatarListItem v-for="al in user.albums"
                    :key="al.id"
                    :img="al.picUrl"
                    :title="al.name"
                    :subTitle="`${al.artist.name} / ${al.size} 首`"
                    @click="handleClick(al.id)">
                </AvatarListItem>
            </mu-list>
        </template>
        <AlbumDetail v-if="album"
            :album="album"></AlbumDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions } from 'vuex';
import { getAlbumDetail } from '@/api/typed';

import AlbumDetail from '@/components/AlbumDetail.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

import { FetchOnLoginMixin } from './fetch-on-login';

export default {
    mixins: [FetchOnLoginMixin],
    data() {
        return {
            /** @type {Models.Album} */
            album: null,
            listLoading: false,
            detailLoading: false
        };
    },
    computed: {
        /** @returns {import('@/store/modules/user').State} */
        user() { return this.$store.state.user; },
    },
    methods: {
        ...mapActions([
            'updateUserAlbums'
        ]),
        async loadAlbum(id) {
            this.detailLoading = true;
            this.album = await getAlbumDetail(id);
            this.detailLoading = false;
        },
        async fetchData() {
            if (this.user.albums.length <= 0) {
                this.listLoading = true;
                await this.updateUserAlbums();
                this.listLoading = false;
            }
            const al = this.user.albums[0];
            if (al && al.id) {
                this.loadAlbum(al.id);
            }
        },
        handleClick(id) {
            this.loadAlbum(id);
        }
    },
    components: {
        AlbumDetail,
        AvatarListItem,
        ListDetailLayout
    }
};
</script>

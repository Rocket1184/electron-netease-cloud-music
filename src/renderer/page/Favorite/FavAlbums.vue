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
        <AlbumDetail :album="album"></AlbumDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import {getAlbumDetail} from '@/api/typed';

import { SET_LOGIN_VALID } from '@/store/mutation-types';
import AlbumDetail from '@/components/AlbumDetail.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

export default {
    data() {
        return {
            album: null,
            listLoading: true,
            detailLoading: true
        };
    },
    computed: {
        ...mapState(['user']),
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
            this.listLoading = true;
            await this.updateUserAlbums();
            this.listLoading = false;
            const al = this.user.albums[0];
            if (al && al.id) {
                this.loadAlbum(al.id);
            }
        },
        handleClick(id) {
            this.loadAlbum(id);
        }
    },
    mounted() {
        if (this.user.loginValid) {
            this.fetchData();
        } else {
            this.$store.subscribe(({ type, payload }) => {
                if (type === SET_LOGIN_VALID && payload === true) {
                    this.fetchData();
                }
            });
        }
    },
    components: {
        AlbumDetail,
        AvatarListItem,
        ListDetailLayout
    }
};
</script>

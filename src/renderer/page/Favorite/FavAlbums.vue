<template>
    <ListDetailLayout class="fav-album"
        :listLoading="listLoading"
        :detailLoading="detailLoading"
        tipText="登录后查看收藏的专辑"
        :showTip="!user.loginValid">
        <mu-list slot="list">
            <AvatarListItem v-for="al in user.albums"
                :key="al.id"
                :img="al.picUrl"
                :title="al.name"
                :subTitle="`${al.artist.name}, ${al.size} 首`"
                @click="handleClick(al.id)">
            </AvatarListItem>
        </mu-list>
        <AlbumDetail slot="detail"
            v-if="ui.fav.album"
            :album="ui.fav.album"></AlbumDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import { SET_LOGIN_VALID } from '@/store/mutation-types';
import AlbumDetail from '@/components/AlbumDetail.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

export default {
    data() {
        return {
            listLoading: false,
            detailLoading: false
        };
    },
    computed: {
        ...mapState(['ui', 'user']),
    },
    methods: {
        ...mapActions([
            'updateUserAlbums',
            'setUiFavAlbum'
        ]),
        async loadAlbum(id) {
            this.detailLoading = true;
            await this.setUiFavAlbum(id);
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
            if (this.ui.fav.album && this.ui.fav.album.id === id) return;
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

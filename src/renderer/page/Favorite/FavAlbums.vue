<template>
    <ListDetailLayout class="fav-album"
        :loading="loading"
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

import AlbumDetail from '@/components/AlbumDetail.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

export default {
    data() {
        return {
            loading: false
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
            this.loading = true;
            await this.setUiFavAlbum(id);
            this.loading = false;
        },
        handleClick(id) {
            if (this.ui.fav.album && this.ui.fav.album.id === id) return;
            this.loadAlbum(id);
        }
    },
    async mounted() {
        await this.updateUserAlbums();
        const al = this.user.albums[0];
        if (al && al.id) {
            this.loadAlbum(al.id);
        }
    },
    components: {
        AlbumDetail,
        AvatarListItem,
        ListDetailLayout
    }
};
</script>

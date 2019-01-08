<template>
    <ListDetailLayout class="fav-album"
        :loading="loading"
        tipText="登录后查看收藏的专辑"
        :showTip="!user.loginValid">
        <mu-list slot="list">
            <mu-list-item v-for="al in user.albums"
                :key="al.id"
                avatar
                button
                @click="handleClick(al.id)">
                <mu-list-item-action>
                    <mu-avatar>
                        <img :src="al | picUrl">
                    </mu-avatar>
                </mu-list-item-action>
                <mu-list-item-content>
                    <mu-list-item-title>{{al.name}}</mu-list-item-title>
                    <mu-list-item-sub-title>{{al | subtitle}}</mu-list-item-sub-title>
                </mu-list-item-content>
            </mu-list-item>
        </mu-list>
        <AlbumDetail slot="detail"
            v-if="ui.fav.album"
            :album="ui.fav.album"></AlbumDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import { sizeImg, HiDpiPx } from '@/util/image';
import AlbumDetail from '@/components/AlbumDetail.vue';
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
        ...mapActions(['setUiFavAlbum']),
        async loadAlbum(id) {
            this.loading = true;
            await this.setUiFavAlbum(id);
            this.loading = false;
        },
        async handleClick(id) {
            if (this.ui.fav.albumDetail && this.ui.fav.albumDetail.id === id) return;
            this.loadAlbum(id);
        }
    },
    filters: {
        picUrl(album) {
            return sizeImg(album.picUrl, HiDpiPx(40));
        },
        subtitle(album) {
            return `${album.artists.map(ar => ar.name).join(',')}，${album.size} 首`;
        }
    },
    mounted() {
        const al = this.user.albums[0];
        if (al && al.id) {
            this.loadAlbum(al.id);
        }
    },
    components: {
        AlbumDetail,
        ListDetailLayout
    }
};
</script>

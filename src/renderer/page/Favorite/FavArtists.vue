<template>
    <ListDetailLayout class="fav-artist"
        :listLoading="listLoading"
        :detailLoading="detailLoading"
        tipText="登录后查看收藏的歌手"
        :showTip="!user.loginValid">
        <mu-list slot="list">
            <AvatarListItem v-for="ar in user.artists"
                :key="ar.id"
                :img="ar.picUrl"
                :title="ar.name"
                :subTitle="`专辑：${ar.albumSize}， MV：${ar.mvSize}`"
                @click="handleClick(ar.id)">
            </AvatarListItem>
        </mu-list>
        <ArtistDetail slot="detail"
            v-if="ui.fav.artist.detail"
            :artist="ui.fav.artist"></ArtistDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import ArtistDetail from '@/components/ArtistDetail/ArtistDetail.vue';
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
            'updateUserArtists',
            'setUiFavArtist'
        ]),
        async loadArtist(id) {
            this.detailLoading = true;
            await this.setUiFavArtist(id);
            this.detailLoading = false;
        },
        handleClick(id) {
            if (this.ui.fav.artist.detail && this.ui.fav.artist.detail.id === id) return;
            this.loadArtist(id);
        }
    },
    async mounted() {
        if (this.user.loginValid) {
            this.listLoading = true;
            await this.updateUserArtists();
            this.listLoading = false;
            const ar = this.user.artists[0];
            if (ar && ar.id) {
                this.loadArtist(ar.id);
            }
        }
    },
    components: {
        ArtistDetail,
        AvatarListItem,
        ListDetailLayout
    }
};
</script>

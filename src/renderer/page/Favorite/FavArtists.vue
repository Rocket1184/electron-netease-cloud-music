<template>
    <ListDetailLayout class="fav-artist"
        :listLoading="listLoading"
        :detailLoading="detailLoading"
        tipText="登录后查看收藏的歌手"
        :showTip="!user.loginValid">
        <template #list>
            <mu-list>
                <AvatarListItem v-for="ar in user.artists"
                    :key="ar.id"
                    :img="ar.picUrl"
                    :title="ar.name"
                    :subTitle="`专辑: ${ar.albumSize} / MV: ${ar.mvSize}`"
                    @click="handleClick(ar.id)">
                </AvatarListItem>
            </mu-list>
        </template>
        <ArtistDetail v-if="artist.detail"
            :artist="artist"></ArtistDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { getArtistDetail } from '@/api/typed';

import ArtistDetail from '@/components/ArtistDetail/ArtistDetail.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

import { FetchOnLoginMixin } from './fetch-on-login';

export default {
    mixins: [FetchOnLoginMixin],
    data() {
        return {
            artist: {
                detail: null,
                hotSongs: []
            },
            listLoading: false,
            detailLoading: false
        };
    },
    computed: {
        ...mapState(['user']),
    },
    methods: {
        ...mapActions([
            'updateUserArtists'
        ]),
        async loadArtist(id) {
            this.detailLoading = true;
            this.artist = await getArtistDetail(id);
            this.detailLoading = false;
        },
        async fetchData() {
            if (this.user.artists.length <= 0) {
                this.listLoading = true;
                await this.updateUserArtists();
                this.listLoading = false;
            }
            const ar = this.user.artists[0];
            if (ar && ar.id) {
                this.loadArtist(ar.id);
            }
        },
        handleClick(id) {
            this.loadArtist(id);
        }
    },
    components: {
        ArtistDetail,
        AvatarListItem,
        ListDetailLayout
    }
};
</script>

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
        <ArtistDetail :artist="artist"></ArtistDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { getArtistDetail } from '@/api/typed';

import { SET_LOGIN_VALID } from '@/store/mutation-types';
import ArtistDetail from '@/components/ArtistDetail/ArtistDetail.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

export default {
    data() {
        return {
            artist: {
                detail: null,
                hotSongs: []
            },
            listLoading: true,
            detailLoading: true
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
            this.listLoading = true;
            await this.updateUserArtists();
            this.listLoading = false;
            const ar = this.user.artists[0];
            if (ar && ar.id) {
                this.loadArtist(ar.id);
            }
        },
        handleClick(id) {
            this.loadArtist(id);
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
        ArtistDetail,
        AvatarListItem,
        ListDetailLayout
    }
};
</script>

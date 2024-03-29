<template>
    <mu-list class="user-music">
        <CenteredLoading v-if="loading"></CenteredLoading>
        <template v-else>
            <template v-if="radios.length">
                <mu-sub-header v-if="radios.length > 0">主播电台</mu-sub-header>
                <router-link v-for="r in radios"
                    :to="{ name: 'djradio', params: { id: r.id } }"
                    :key="'r' + r.id"
                    v-slot="{ navigate }"
                    custom>
                    <AvatarListItem :img="r.picUrl"
                        :title="r.name"
                        :subTitle="r.desc"
                        :titleTag="r.category"
                        @click="navigate"></AvatarListItem>
                </router-link>
            </template>
            <!-- <mu-sub-header>音乐专栏</mu-sub-header> -->
            <template v-if="listCreated.length">
                <mu-sub-header>创建的歌单</mu-sub-header>
                <!-- TODO: 歌单分页展示，或者上 RecycleScroller -->
                <router-link v-for="p in listCreated"
                    :key="'p' + p.id"
                    :to="{ name: 'playlist', params: { id: p.id } }"
                    v-slot="{ navigate }"
                    custom>
                    <AvatarListItem :img="p.coverImgUrl"
                        :title="p.name"
                        :subTitle="formatPlaylistSubtitle(p)"
                        @click="navigate"></AvatarListItem>
                </router-link>
            </template>
            <template v-if="listCollected.length">
                <mu-sub-header>收藏的歌单</mu-sub-header>
                <router-link v-for="p in listCollected"
                    :key="p.id"
                    :to="{ name: 'playlist', params: { id: p.id } }"
                    v-slot="{ navigate }"
                    custom>
                    <AvatarListItem :img="p.coverImgUrl"
                        :title="p.name"
                        :subTitle="formatPlaylistSubtitle(p)"
                        @click="navigate"></AvatarListItem>
                </router-link>
            </template>
        </template>
    </mu-list>
</template>

<script>
import Api from '@/api/ipc';

import AvatarListItem from '@/components/AvatarListItem.vue';
import CenteredLoading from '@/components/CenteredLoading.vue';

export default {
    props: {
        /** @type {Vue.PropOptions<Types.UserInfoRes>} */
        user: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            loading: true,
            /** @type {Types.SubscribedDjRadio[]} */
            radios: [],
            // columns: [],
            /** @type {Types.UserPlaylist[]} */
            playlists: []
        };
    },
    computed: {
        /** @returns {Models.Playlist[]} */
        listCreated() {
            return this.playlists.filter(p => p.creator.userId === this.user.profile.userId);
        },
        /** @returns {Models.Playlist[]} */
        listCollected() {
            return this.playlists.filter(p => p.creator.userId !== this.user.profile.userId);
        }
    },
    methods: {
        loadData() {
            this.loading = true;
            const id = this.user.profile.userId;
            const p1 = Api.getDjRadioCreatedBy(id).then(r => {
                if (r.code === 200) {
                    this.radios = r.djRadios;
                }
            });
            const p2 = Api.getUserPlaylists(id).then(r => {
                if (r.code === 200) {
                    this.playlists = r.playlist;
                }
            });
            Promise.all([p1, p2]).then(() => this.loading = false);
        },
        formatPlaylistSubtitle(p) {
            return `共 ${p.trackCount} 首，${p.playCount} 次播放，${p.subscribedCount} 人收藏`;
        }
    },
    mounted() {
        this.loadData();
    },
    components: {
        AvatarListItem,
        CenteredLoading
    }
};
</script>

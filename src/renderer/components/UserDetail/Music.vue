<template>
    <mu-list class="user-music">
        <CenteredLoading v-if="loading"></CenteredLoading>
        <template v-else>
            <template v-if="radios.length">
                <mu-sub-header v-if="radios.length > 0">主播电台</mu-sub-header>
                <AvatarListItem v-for="r in radios"
                    :key="'r' + r.id"
                    :img="r.picUrl"
                    :title="r.name"
                    :subTitle="r.desc"
                    :titleTag="r.category"
                    :to="{ name: 'djradio', params: { id: r.id } }"></AvatarListItem>
            </template>
            <!-- <mu-sub-header>音乐专栏</mu-sub-header> -->
            <mu-sub-header>创建的歌单</mu-sub-header>
            <AvatarListItem :title="`${user.profile.nickname}的听歌排行`"
                :subTitle="`累计听歌 ${user.listenSongs} 首`"
                :to="{ path: '/listen_record' }">
                <mu-avatar color="#383838"
                    text-color="white">
                    <mu-icon value="equalizer"></mu-icon>
                </mu-avatar>
            </AvatarListItem>
            <AvatarListItem v-for="p in listCreated"
                :key="'p' + p.id"
                :img="p.coverImgUrl"
                :title="p.name"
                :subTitle="p | formatPlaylistSubtitle"
                :to="{ name: 'playlist', params: { id: p.id } }"></AvatarListItem>
            <template v-if="listCollected.length">
                <mu-sub-header>收藏的歌单</mu-sub-header>
                <AvatarListItem v-for="p in listCollected"
                    :key="p.id"
                    :img="p.coverImgUrl"
                    :title="p.name"
                    :subTitle="p | formatPlaylistSubtitle"
                    :to="{ name: 'playlist', params: { id: p.id } }"></AvatarListItem>
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
        user: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            loading: true,
            radios: [],
            // columns: [],
            playlists: []
        };
    },
    computed: {
        listCreated() {
            return this.playlists.filter(p => p.creator.userId === this.user.profile.userId);
        },
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
            const p2 = Api.getUserPlaylist(id).then(r => {
                if (r.code === 200) {
                    this.playlists = r.playlist;
                }
            });
            Promise.all([p1, p2]).then(() => this.loading = false);
        }
    },
    filters: {
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

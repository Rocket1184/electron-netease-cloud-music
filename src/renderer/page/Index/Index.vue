<template>
    <div class="index ncm-page">
        <div class="index-wrapper">
            <div class="index-actions">
                <ActionItem v-for="a in action"
                    :key="a.title"
                    :to="a.to"
                    :icon="a.icon"
                    :title="a.title">
                </ActionItem>
            </div>
            <mu-card class="index-card">
                <div class="card-title">推荐歌单</div>
                <div class="card-scroller">
                    <ScrollerItem v-for="p in playlist"
                        :key="p.id"
                        :to="{ name: 'playlist', params: { id: p.id } }"
                        :img="p.picUrl"
                        maskIcon="headset"
                        :maskText="humanCount(p.playcount || p.playCount)"
                        :title="p.copywriter"
                        :itemTitle="p.name"></ScrollerItem>
                </div>
            </mu-card>
            <mu-card class="index-card">
                <div class="card-title">最新音乐</div>
                <div class="card-scroller">
                    <ScrollerItem v-for="al in album"
                        :key="al.id"
                        :to="{ name: 'album', params: { id: al.id } }"
                        :img="al.picUrl"
                        :title="al.copywriter"
                        :itemTitle="al.name"
                        :itemSubTitle="al.artistName"></ScrollerItem>
                </div>
            </mu-card>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

import Api from '@/util/api';
import ActionItem from './ActionItem.vue';
import ScrollerItem from './ScrollerItem.vue';
import { humanCount } from '@/util/formatter';

export default {
    name: 'page-index',
    data() {
        return {
            action: [
                { title: '私人 FM', icon: 'radio', to: { name: 'radio' } },
                { title: '每日推荐', icon: 'audiotrack', to: { name: 'recommend' } },
                { title: '歌单', icon: 'playlist_play', to: { path: '/goodie' } },
                { title: '排行榜', icon: 'equalizer', to: { path: '/top' } }
            ],
            playlist: [],
            album: []
        };
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        humanCount
    },
    mounted() {
        if (this.user.loginPending || this.user.loginValid) {
            Api.getRecommendPlaylist().then(res => this.playlist = res.recommend);
        } else {
            Api.getPersonalizedPlaylists().then(res => this.playlist = res.result);
        }
        Api.getNewAlbums().then(res => {
            if (res.code === 200) {
                res.result.forEach(r => {
                    if (r.alg === 'artistbased' || r.alg === 'tagbased' || r.alg === 'itembased') {
                        this.album.unshift(r);
                    } else {
                        this.album.push(r);
                    }
                });
            }
        });
    },
    components: {
        ActionItem,
        ScrollerItem
    }
};
</script>

<style lang="less">
.index-wrapper {
    user-select: none;
    min-height: 100vh;
    max-width: 800px;
    margin: auto;
    .index-actions {
        margin: 36px 0;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
    }
    .index-card {
        margin: 24px 0;
        height: 278px;
        .card-title {
            font-size: 24px;
            font-weight: bold;
            padding: 12px;
            opacity: 0.62;
        }
        .card-scroller {
            direction: rtl;
            height: calc(100vw - 10px);
            max-height: 800px;
            width: 218px;
            transform: rotate(-90deg) translateX(-100%);
            transform-origin: 0 0;
            overflow: auto;
        }
    }
}
</style>

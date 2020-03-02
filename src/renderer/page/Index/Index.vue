<template>
    <div class="index ncm-page">
        <div class="wrapper">
            <div class="actions">
                <ActionItem v-for="a in action"
                    :key="a.title"
                    :to="a.to"
                    :icon="a.icon"
                    :title="a.title">
                </ActionItem>
            </div>
            <mu-card class="card">
                <div class="heading">推荐歌单</div>
                <div class="scroller">
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
            <mu-card v-if="!settings.filterRcmd"
                class="card">
                <div class="heading">最新音乐</div>
                <div class="scroller">
                    <ScrollerItem v-for="al in album"
                        :key="al.id"
                        :to="{ name: 'album', params: { id: al.id } }"
                        :img="al.picUrl"
                        :title="al.copywriter"
                        :itemTitle="al.name"
                        :itemSubTitle="al.artistName"></ScrollerItem>
                </div>
            </mu-card>
            <mu-card v-if="!settings.filterRcmd"
                class="card">
                <div class="heading">推荐 MV</div>
                <div class="scroller">
                    <ScrollerItem v-for="v in mv"
                        :key="v.id"
                        :to="{ name: 'video', params: { id: v.id } }"
                        :img="v.picUrl"
                        :title="v.copywriter"
                        :itemTitle="v.name"
                        :itemSubTitle="v.artistName"></ScrollerItem>
                </div>
            </mu-card>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

import Api from '@/api/ipc';
import ActionItem from './ActionItem.vue';
import ScrollerItem from './ScrollerItem.vue';
import { humanCount } from '@/util/formatter';
import { SET_LOGIN_VALID } from '@/store/mutation-types';

const algBlockList = [
    'official_playlist_sceneRank'
];

export default {
    name: 'Index',
    data() {
        return {
            action: [
                { title: '私人 FM', icon: 'radio', to: { name: 'radio' } },
                { title: '每日推荐', icon: 'audiotrack', to: { name: 'recommend' } },
                { title: '歌单', icon: 'playlist_play', to: { path: '/goodie' } },
                { title: '排行榜', icon: 'equalizer', to: { path: '/top' } }
            ],
            playlist: [],
            album: [],
            mv: []
        };
    },
    computed: {
        ...mapState([
            'user',
            'settings'
        ])
    },
    methods: {
        humanCount,
        filterRecommend(item) {
            return algBlockList.includes(item.alg);
        },
        async getPlaylists() {
            if (this.user.loginPending || this.user.loginValid) {
                const res = await Api.getRecommendPlaylist();
                if (res.code === 200) {
                    if (this.settings.filterRcmd) {
                        this.playlist = res.recommend.filter(r => !this.filterRecommend(r));
                    } else {
                        this.playlist = res.recommend;
                    }
                }
            } else {
                const res = await Api.getPersonalizedPlaylists();
                if (res.code === 200) {
                    this.playlist = res.result;
                }
            }
        },
        async getAlbums() {
            const res = await Api.getNewAlbums();
            if (res.code === 200) {
                this.album = res.result;
            }
        },
        async getMVs() {
            const res = await Api.getRecommendMVs();
            if (res.code === 200) {
                this.mv = res.result;
            }
        },
        fetchData() {
            this.getPlaylists();
            if (this.settings.filterRcmd) return;
            this.getAlbums();
            this.getMVs();
        },
    },
    created() {
        this.fetchData();
        this.unsub = this.$store.subscribe(({ type, payload }) => {
            if (
                type === SET_LOGIN_VALID &&
                (
                    payload === false ||  // clear personalized data on logout
                    (payload === true && this.playlist.length > 0) // get personalized data on login
                )
            ) {
                this.fetchData();
            }
        });
    },
    mounted() {
        /** @type {HTMLDivElement[]} */
        const scrollers = Array.from(document.getElementsByClassName('scroller'));
        scrollers.forEach(s => {
            s.addEventListener('wheel', function (ev) {
                if (ev.deltaX !== 0 || ev.shiftKey) {
                    // horizontal scroll with touchpad || hold shift
                    return;
                }
                if (ev.deltaX === 0 && Number.isInteger(ev.deltaY)) {
                    // `ev.deltaY` is integer, (likely) vertical scroll with mouse wheel
                    ev.preventDefault();
                    this.scrollBy({ top: 0, left: ev.deltaY, behavior: 'instant' });
                }
            });
        });
    },
    beforeDestroy() {
        this.unsub();
    },
    components: {
        ActionItem,
        ScrollerItem
    }
};
</script>

<style lang="less">
.wrapper {
    user-select: none;
    max-width: 800px;
    margin: auto;
    .actions {
        margin: 36px 0;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
    }
    .card {
        margin: 24px 0;
        .heading {
            font-size: 24px;
            font-weight: bold;
            padding: 12px;
            opacity: 0.62;
        }
        .scroller {
            display: flex;
            overflow: auto;
            min-height: 218px;
            &::after {
                content: ' ';
                flex-shrink: 0;
                flex-basis: 12px;
            }
        }
    }
}
</style>

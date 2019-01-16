<template>
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
            <div class="h-title">推荐歌单</div>
            <div class="h-scroller">
                <ScrollerItem v-for="p in playlist"
                    :key="p.id"
                    :to="{ name: 'playlist', params: { id: p.id } }"
                    :img="p.picUrl"
                    subIcon="headset"
                    :subTitle="p.playcount || p.playCount"
                    :desc="p.name"></ScrollerItem>
            </div>
        </mu-card>
        <mu-card class="index-card">
            <div class="h-title">推荐 MV</div>
            <div class="h-scroller">
                <ScrollerItem v-for="v in mv"
                    :key="v.id"
                    :to="{ name: 'video', params: { id: v.id } }"
                    :img="v.picUrl"
                    subIcon="videocam"
                    :subTitle="v.playCount"
                    :desc="v.name"></ScrollerItem>
            </div>
        </mu-card>
    </div>
</template>

<script>
import Api from '@/util/api';
import ActionItem from './ActionItem.vue';
import ScrollerItem from './ScrollerItem.vue';

export default {
    name: 'page-index',
    data() {
        return {
            action: [
                { title: '私人 FM', icon: 'radio', to: { path: '/fm' } },
                { title: '每日推荐', icon: 'audiotrack', to: { path: '/recommend' } },
                { title: '歌单', icon: 'playlist_play', to: { path: '/goodie' } },
                { title: '排行榜', icon: 'equalizer', to: { path: '/top' } }
            ],
            playlist: [],
            mv: []
        };
    },
    mounted() {
        Api.getRecommendPlaylist().then(res => {
            if (res.code === 200) {
                this.playlist = res.recommend;
            } else {
                Api.getPersonalizedPlaylists().then(res => this.playlist = res.result);
            }
        });
        Api.getRecommendMVs().then(res => this.mv = res.result);
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
    min-height: 110%;
    max-width: 800px;
    margin: auto;
    .index-actions {
        margin-top: 36px;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
    }
    .index-card {
        margin: 24px 0;
        .h-title {
            font-size: 24px;
            font-weight: bold;
            padding: 12px;
            opacity: 0.62;
        }
        .h-scroller {
            width: 100%;
            display: flex;
            flex-wrap: nowrap;
            overflow: auto;
            padding-right: 12px;
        }
    }
}
</style>

<template>
    <ListDetailLayout class="ncm-page"
        showBack
        :detailLoading="loading">
        <template #list>
            <mu-list v-if="user.loginValid">
                <mu-list-item>
                    <mu-list-item-content>
                        <mu-list-item-title>个性化推荐如何工作</mu-list-item-title>
                    </mu-list-item-content>
                </mu-list-item>
                <div class="recommend-desc">
                    <p>它聪明、熟悉每个用户的喜好，从海量音乐中挑选出你可能喜欢的音乐。</p>
                    <p>它通过你每一次操作来记录你的口味：</p>
                </div>
                <mu-list-item>
                    <mu-list-item-action>
                        <mu-icon value="play_circle_filled"></mu-icon>
                    </mu-list-item-action>
                    <mu-list-item-title>你播放了 <span class="recommend-cnt">{{recommend.statistics.playCnt}}</span> 首音乐</mu-list-item-title>
                </mu-list-item>
                <mu-list-item>
                    <mu-list-item-action>
                        <mu-icon value="favorite"></mu-icon>
                    </mu-list-item-action>
                    <mu-list-item-title>你喜欢了 <span class="recommend-cnt">{{recommend.statistics.likeCnt}}</span> 首音乐</mu-list-item-title>
                </mu-list-item>
                <mu-list-item>
                    <mu-list-item-action>
                        <mu-icon value="person_add"></mu-icon>
                    </mu-list-item-action>
                    <mu-list-item-title>你收藏了 <span class="recommend-cnt">{{recommend.statistics.followCnt}}</span> 位歌手</mu-list-item-title>
                </mu-list-item>
            </mu-list>
        </template>
        <template v-if="user.loginValid">
            <mu-card-media title="每日歌曲推荐"
                sub-title="根据你的音乐口味生成，每天 6:00 更新">
                <div class="recommend-header"></div>
            </mu-card-media>
            <TrackListHeader :tracks="recommend.songs"></TrackListHeader>
            <mu-divider></mu-divider>
            <RecommendSongList :tracks="recommend.songs"
                @dislike="handleDislike"></RecommendSongList>
        </template>
        <CenteredTip v-else
            icon="audiotrack"
            tip="登录后开启每日推荐"></CenteredTip>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import { SET_LOGIN_VALID } from '@/store/mutation-types';

import ListDetailLayout from '@/components/ListDetailLayout.vue';
import CenteredTip from '@/components/CenteredTip.vue';
import TrackListHeader from '@/components/TrackList/TrackListHeader.vue';
import RecommendSongList from './RecommendSongList.vue';

export default {
    data() {
        return {
            loading: false
        };
    },
    computed: {
        ...mapState(['recommend', 'user'])
    },
    methods: {
        ...mapActions([
            'updateRecommendSongs',
            'updateRecommendStatistics',
            'dislikeRecommend'
        ]),
        shouldUpdateSongs() {
            if (this.recommend.timestamp < 0) return true;
            const now = new Date();
            const lastUpdate = new Date(this.recommend.timestamp);
            let nextUpdate = new Date(lastUpdate);
            // 每日 UTC+8 6:00 对应 UTC 22:00
            nextUpdate.setUTCMinutes(0);
            nextUpdate.setUTCSeconds(0);
            nextUpdate.setUTCHours(22);
            if (lastUpdate.getUTCHours() >= 22) {
                nextUpdate.setUTCDate(lastUpdate.getUTCDate() + 1);
            }
            if (now.getTime() >= nextUpdate.getTime()) return true;
            return false;
        },
        fetchData() {
            if (this.shouldUpdateSongs()) {
                this.loading = true;
                this.updateRecommendSongs()
                    .then(() => this.loading = false);
            }
            this.updateRecommendStatistics();
        },
        async handleDislike(id) {
            const resp = await this.dislikeRecommend({ id });
            if (resp.code === 200) {
                if (resp.data.id) {
                    this.$toast.message('已替换歌曲');
                } else {
                    this.$toast.message('已标记为不感兴趣');
                }
            } else {
                this.$toast.message(`${resp.code}: ${resp.msg}`);
            }
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
        ListDetailLayout,
        CenteredTip,
        TrackListHeader,
        RecommendSongList
    }
};
</script>

<style lang="less">
.recommend-desc {
    color: grey;
    padding: 0 16px;
}
.recommend-cnt {
    font-weight: bold;
    color: #d32f2f;
}
.recommend-header {
    height: 200px;
    background: linear-gradient(45deg, #959ca6, #e1dfd2, #a59d97);
    background-position: 50%, 50%;
}
</style>


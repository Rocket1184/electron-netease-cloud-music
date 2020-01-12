<template>
    <div class="video-detail">
        <div class="desc">
            <span class="title">{{video.name}}</span>
            <span class="by">by</span>
            <router-link v-for="u in video.creator"
                :key="u.id"
                class="creator"
                :to="{ name: 'user', params: { id: u.id } }"
                tag="a">{{u.name}}</router-link>
        </div>
        <video ref="videoEl"
            :src="videoSrc"
            :poster="videoPoster"
            preload="none"
            controls></video>
        <div class="actions">
            <mu-button flat
                small
                @click="handleLike">
                <mu-icon left
                    :color="threadInfo.liked ? 'primary': ''"
                    value="thumb_up"></mu-icon>
                <span>{{btnLikeText}}</span>
            </mu-button>
            <mu-button flat
                small
                @click="handleSubscribe">
                <mu-icon left
                    :value="statistic.subscribed ? 'star': 'star_border'"
                    :color="statistic.subscribed ? 'amber': ''"></mu-icon>
                <span>{{btnFavText}}</span>
            </mu-button>
            <mu-button flat
                small
                :to="{ name: 'comment', params: { type: 'video', id: video.id } }">
                <mu-icon left
                    value="comment"></mu-icon>
                <span>{{btnCommentText}}</span>
            </mu-button>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Api from '@/api/ipc';
import { sizeImg, HiDpiPx } from '@/util/image';

export default {
    props: {
        video: {
            required: true
        }
    },
    data() {
        return {
            videoSrc: null,
            statistic: {
                playTime: '...',
                praisedCount: '...',
                subscribeCount: '...',
                subscribed: false
            },
            threadInfo: {
                commentCount: '...',
                liked: false,
                likedCount: '...',
                shareCount: '...'
            }
        };
    },
    computed: {
        ...mapState(['user']),
        videoPoster() {
            return sizeImg(this.video.picUrl, HiDpiPx(720), HiDpiPx(405));
        },
        btnLikeText() {
            const t = this.threadInfo.liked ? '已赞' : '赞';
            return `${t} (${this.threadInfo.likedCount})`;
        },
        btnFavText() {
            const t = this.statistic.subscribed ? '已收藏' : '收藏';
            return `${t} (${this.statistic.subscribeCount})`;
        },
        btnCommentText() {
            return `评论 (${this.threadInfo.commentCount})`;
        }
    },
    methods: {
        ...mapActions([
            'likeResource',
            'unlikeResource',
            'subscribeVideo',
            'unsubscribeVideo'
        ]),
        async getVideoSrc() {
            const resp = await Api.getVideoURL(this.video.id);
            if (resp.code === 200) {
                this.videoSrc = resp.urls[0].url.replace(/^http:/, 'https:');
            }
        },
        refreshStatistic() {
            Api.getVideoStatistic(this.video.id)
                .then(res => this.statistic = res.data);
        },
        refreshThreadInfo() {
            Api.getCommentThreadInfoE(this.video.commentThreadId)
                .then(res => this.threadInfo = res);
        },
        async handleLike() {
            if (!this.user.loginValid) {
                this.$toast.message('汝还没有登录呀      (눈‸눈)');
                return;
            }
            try {
                if (this.threadInfo.liked) {
                    await this.unlikeResource(this.video.commentThreadId);
                    this.threadInfo.liked = false;
                    this.threadInfo.likedCount -= 1;
                } else {
                    await this.likeResource(this.video.commentThreadId);
                    this.threadInfo.liked = true;
                    this.threadInfo.likedCount += 1;
                }
                setTimeout(() => this.refreshThreadInfo(), 1000);
            } catch (e) {
                this.$toast.message(e.message);
            }
        },
        async handleSubscribe() {
            if (!this.user.loginValid) {
                this.$toast.message('汝还没有登录呀      (눈‸눈)');
                return;
            }
            try {
                if (this.statistic.subscribed) {
                    await this.unsubscribeVideo(this.video);
                    this.statistic.subscribed = false;
                    this.statistic.subscribeCount -= 1;
                } else {
                    await this.subscribeVideo(this.video);
                    this.statistic.subscribed = true;
                    this.statistic.subscribeCount += 1;
                }
                setTimeout(() => this.refreshStatistic(), 1000);
            } catch (e) {
                this.$toast.message(e.message);
            }
        }
    },
    mounted() {
        this.getVideoSrc();
        this.refreshStatistic();
        this.refreshThreadInfo();
    }
};
</script>

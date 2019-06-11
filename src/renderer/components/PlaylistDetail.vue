<template>
    <div class="album-detail playlist-detail">
        <div class="header">
            <img :src="coverSrc"
                class="cover">
            <div class="side">
                <div class="info">
                    <div class="name">{{playlist.name}}</div>
                    <div class="creation-info">
                        <div class="creator">
                            <mu-avatar class="avatar">
                                <img :src="creatorAvatarSrc">
                            </mu-avatar>
                            <span class="creator-name">{{playlist.creator.nickname}}</span>
                        </div>
                        <span class="create-time  mu-item-after-text">创建于 {{createTime}}</span>
                    </div>
                </div>
                <div class="actions">
                    <PlayTracksButton small
                        :total="playlist.trackCount"
                        :source="trackSource"
                        :tracks="tracks"
                        :disabled="!tracksLoaded"></PlayTracksButton>
                    <mu-button flat
                        small
                        :disabled="playlist.creator.id === user.info.id"
                        @click="handleSubscribe">
                        <mu-icon left
                            :color="shouldSubscribed ? 'amber' : ''"
                            :value="shouldSubscribed ? 'star' : 'star_border'"></mu-icon>
                        <span>{{btnSubscribeText}}</span>
                    </mu-button>
                    <mu-button flat
                        small
                        :to="{ name: 'comment', params: { type: 'playlist', id: playlist.id } }">
                        <mu-icon left
                            value="comment"></mu-icon>
                        <span>{{btnCommentText}}</span>
                    </mu-button>
                </div>
                <div class="intro">
                    <mu-list dense
                        toggle-nested>
                        <mu-list-item button
                            nested
                            :open="descOpen"
                            @click="descOpen = !descOpen">
                            <mu-list-item-title>歌单介绍</mu-list-item-title>
                            <mu-list-item-action>
                                <mu-icon class="toggle-icon"
                                    size="24"
                                    value="keyboard_arrow_down"></mu-icon>
                            </mu-list-item-action>
                            <template #nested>
                                <mu-list-item-content>
                                    <p class="description">{{playlistDesc}}</p>
                                </mu-list-item-content>
                            </template>
                        </mu-list-item>
                    </mu-list>
                </div>
            </div>
        </div>
        <div class="tracks">
            <mu-sub-header>曲目列表</mu-sub-header>
            <mu-divider></mu-divider>
            <VirtualTrackList :source="trackSource"
                :trackIds="playlist.trackIds"
                @load="handleTracksLoad"></VirtualTrackList>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import VirtualTrackList from './TrackList/VirtualTrackList.vue';
import PlayTracksButton from './PlayTracksButton.vue';
import { shortDate } from '@/util/formatter';
import { sizeImg, HiDpiPx } from '@/util/image';

export default {
    props: {
        playlist: {
            required: true
        }
    },
    data() {
        return {
            shouldSubscribed: null,
            subsCntOffset: 0,
            descOpen: false,
            tracksLoaded: false,
            tracks: []
        };
    },
    computed: {
        ...mapState(['user']),
        creatorAvatarSrc() {
            return sizeImg(this.playlist.creator.avatarUrl, HiDpiPx(40));
        },
        coverSrc() {
            return sizeImg(this.playlist.coverImgUrl, HiDpiPx(160));
        },
        createTime() {
            return shortDate(this.playlist.createTime);
        },
        btnSubscribeText() {
            const t = this.shouldSubscribed ? '已收藏' : '收藏';
            const n = this.playlist.subscribedCount + this.subsCntOffset;
            return `${t} (${n})`;
        },
        btnCommentText() {
            const n = this.playlist.commentCount;
            return `评论 (${n})`;
        },
        playlistDesc() {
            const t = this.playlist.tags.join('，') || '无';
            const d = this.playlist.description || '暂无歌单介绍';
            return `标签：${t}\n\n${d}`;
        },
        trackSource() {
            return {
                name: 'list',
                id: this.playlist.id
            };
        }
    },
    methods: {
        ...mapActions([
            'subscribePlaylist',
            'unsubscribePlaylist'
        ]),
        handleTracksLoad(tracks) {
            this.tracksLoaded = true;
            this.tracks = tracks;
        },
        async handleSubscribe() {
            if (!this.user.loginValid) {
                this.$toast.message('汝还没有登录呀      (눈‸눈)');
                return;
            }
            if (this.shouldSubscribed) {
                try {
                    await this.unsubscribePlaylist(this.playlist);
                    this.shouldSubscribed = false;
                    this.subsCntOffset--;
                } catch (e) {
                    this.$toast.message(`取消收藏失败 ●﹏● ： ${e.code}`);
                }
                return;
            }
            try {
                await this.subscribePlaylist(this.playlist);
                this.shouldSubscribed = true;
                this.subsCntOffset++;
            } catch (e) {
                this.$toast.message(`收藏歌单失败 ●﹏● ： ${e.code}`);
            }
        }
    },
    created() {
        this.shouldSubscribed = this.playlist.subscribed;
    },
    components: {
        PlayTracksButton,
        VirtualTrackList
    }
};
</script>

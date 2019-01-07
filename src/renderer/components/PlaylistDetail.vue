<template>
    <div class="playlist-detail">
        <div class="header">
            <img :src="coverSrc"
                class="cover">
            <div class="desc">
                <p class="name">{{playlist.name}}</p>
                <div class="creator">
                    <mu-avatar class="avatar">
                        <img :src="creatorAvatarSrc">
                    </mu-avatar>
                    <span class="creator-name">{{playlist.creator.nickname}}</span>
                    <span class="create-time">创建于 {{createTime}}</span>
                </div>
                <div class="actions">
                    <mu-button flat
                        :disabled="playlist.creator.id === user.info.id"
                        @click="handleSubscribe">
                        <mu-icon left
                            :color="shouldSubscribed ? 'amber' : ''"
                            :value="shouldSubscribed ? 'star' : 'star_border'"></mu-icon>
                        <span>{{ shouldSubscribed ? '已收藏' : '收藏' }} ({{formatCount(playlist.subscribedCount + subsCntOffset)}})</span>
                    </mu-button>
                    <mu-button flat>
                        <mu-icon left
                            value="comment"></mu-icon>
                        <span>评论 ({{formatCount(playlist.commentCount)}})</span>
                    </mu-button>
                </div>
                <div class="intro">
                    <mu-list toggle-nested>
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
                            <mu-list-item-content slot="nested">
                                <div class="description">{{playlist.description}}</div>
                            </mu-list-item-content>
                        </mu-list-item>
                    </mu-list>
                </div>
            </div>
        </div>
        <div class="tracks">
            <mu-sub-header>曲目列表</mu-sub-header>
            <PlayTracks :tracks="playlist.tracks"></PlayTracks>
            <TrackList :tracks="tracksToShow"
                :indexOffset="tracksOffset"></TrackList>
            <div class="pagination"
                v-if="playlist.tracks.length > 50">
                <mu-pagination :total="playlist.tracks.length"
                    :current="currentPage"
                    :page-size="pageSize"
                    @change="handlePageChange">
                </mu-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import PlayTracks from './PlayTracks.vue';
import TrackList from './TrackList.vue';
import { sizeImg, HiDpiPx } from '@/util/image';
import { shortDate } from '@/util/formatter';

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
            scrollHeight: 200,
            currentPage: 1,
            pageSize: 50
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
        tracksOffset() {
            return (this.currentPage - 1) * this.pageSize;
        },
        tracksToShow() {
            return this.playlist.tracks.slice(this.tracksOffset, this.tracksOffset + this.pageSize);
        }
    },
    methods: {
        ...mapActions(['subscribePlaylist', 'unsubscribePlaylist']),
        formatCount(cnt) {
            return typeof cnt === 'number' ? cnt : '...';
        },
        handlePageChange(newIndex) {
            this.$emit('detail-scroll', this.scrollHeight);
            this.currentPage = newIndex;
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
        PlayTracks,
        TrackList
    }
};
</script>

<style lang="less">
.playlist-detail {
    .header {
        display: flex;
        padding: 16px;
        .cover {
            height: 160px;
            width: 160px;
            min-width: 160px;
            margin-right: 10px;
        }
        .desc {
            flex-grow: 1;
            .name {
                font-size: 20px;
                margin: 0 0 8px 12px;
            }
            .creator {
                margin: 8px 12px;
                display: flex;
                align-items: center;
                .creator-name {
                    margin: 0 10px;
                }
                .create-time {
                    color: grey;
                }
            }
            .actions {
                display: flex;
            }
            .intro {
                .mu-list {
                    padding: 0;
                }
                .description {
                    margin: 8px;
                    white-space: pre-wrap;
                }
            }
        }
    }
    .tracks {
        .pagination {
            width: 100%;
            padding: 16px;
        }
    }
}
</style>

<template>
    <div class="playlist-detail">
        <div class="header">
            <img :src="coverSrc"
                class="cover">
            <div class="desc">
                <p class="name">{{detail.name}}</p>
                <div class="creator">
                    <mu-avatar slot="left"
                        class="avatar"
                        :src="creatorAvatarSrc" />
                    <span class="creator-name">{{detail.creator.nickname}}</span>
                    <span class="create-time">创建于 {{createTime}}</span>
                </div>
                <div class="actions">
                    <mu-flat-button :label="`收藏 (${formatCount(detail.subscribedCount)})`"
                        :icon="detail.subscribed ? 'star' : 'star_border'" />
                    <mu-flat-button :label="`评论 (${formatCount(detail.commentCount)})`"
                        icon="comment" />
                </div>
                <div class="intro">
                    <mu-list-item title="歌单介绍"
                        toggleNested
                        :open="false">
                        <mu-content-block slot="nested">
                            <pre>{{detail.description}}</pre>
                        </mu-content-block>
                    </mu-list-item>
                </div>
            </div>
        </div>
        <div class="tracks">
            <mu-sub-header>曲目列表</mu-sub-header>
            <PlayAll :tracks="detail.tracks"></PlayAll>
            <TrackList :tracks="tracksToShow"
                :indexOffset="tracksOffset"></TrackList>
            <div class="pagination"
                v-if="detail.tracks.length > 50">
                <mu-pagination :total="detail.tracks.length"
                    :current="currentPage"
                    :pageSize="pageSize"
                    @pageChange="handlePageChange">
                </mu-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import PlayAll from '@/components/playAll.vue';
import TrackList from '@/components/trackList.vue';
import { sizeImg, HiDpiPx } from '@/util/image';
import { shortDate } from '@/util/formatter';

export default {
    props: {
        detail: {
            required: true
        }
    },
    data() {
        return {
            currentPage: 1,
            pageSize: 50
        };
    },
    computed: {
        creatorAvatarSrc() {
            return sizeImg(this.detail.creator.avatarUrl, HiDpiPx(40));
        },
        coverSrc() {
            return sizeImg(this.detail.coverImgUrl, HiDpiPx(160));
        },
        createTime() {
            return shortDate(this.detail.createTime);
        },
        tracksOffset() {
            return (this.currentPage - 1) * this.pageSize;
        },
        tracksToShow() {
            return this.detail.tracks.slice(this.tracksOffset, this.tracksOffset + this.pageSize);
        }
    },
    methods: {
        formatCount(cnt) {
            return typeof cnt === 'number' ? cnt : '...';
        },
        handlePageChange(newIndex) {
            this.currentPage = newIndex;
        }
    },
    components: {
        PlayAll,
        TrackList
    }
};
</script>

<style lang="less">
.playlist-detail {
    .header {
        display: flex;
        padding: 16px 16px 0 16px;
        .cover {
            height: 160px;
            width: 160px;
            margin-right: 16px;
        }
        .desc {
            flex-grow: 1;
            .name {
                font-size: 20px;
                margin-top: 0;
                margin-left: 12px;
            }
            .creator {
                margin: 10px 0 10px 16px;
                .avatar,
                .creator-name,
                .create-time {
                    vertical-align: middle;
                }
                .creator-name {
                    margin: 0 10px;
                }
                .create-time {
                    color: grey;
                }
            }
            .actions {
                span {
                    line-height: 48px;
                    display: inline-block;
                }
            }
        }
    }
    .tracks {
        margin-right: 16px;
        .pagination {
            width: 100%;
            padding: 16px;
        }
    }
}
</style>

<template>
    <div class="playlist-header">
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
                <mu-flat-button :label="`收藏 (${detail.subscribedCount})`"
                    :icon="detail.subscribed ? 'star' : 'star_border'" />
                <mu-flat-button :label="`评论 (${detail.commentCount})`"
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
</template>

<script>
import { getImgSizeOf, HiDpiPx } from 'util/image';
import { shortDate } from 'util/formatter';

export default {
    props: {
        detail: {
            required: true
        }
    },
    computed: {
        creatorAvatarSrc() {
            return getImgSizeOf(this.detail.creator.avatarUrl, HiDpiPx(40))
        },
        coverSrc() {
            return getImgSizeOf(this.detail.coverImgUrl, HiDpiPx(160));
        },
        createTime() {
            return shortDate(this.detail.createTime);
        }
    }
};
</script>

<style lang="less">
.playlist-header {
    min-height: 200px;
    background-size: cover;
    .cover {
        height: 160px;
        width: 160px;
        margin: 20px 10px 0 40px;
    }
    .desc {
        display: inline-block;
        margin-top: 20px;
        vertical-align: top;
        width: calc(~"100% - 240px");
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
    }
    .actions {
        span {
            line-height: 48px;
            display: inline-block;
        }
    }
}
</style>

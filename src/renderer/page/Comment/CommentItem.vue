<template>
    <div class="comment-item">
        <div class="avatar">
            <mu-avatar>
                <img :src="comment.user | avatarImgSrc">
            </mu-avatar>
        </div>
        <div class="text">
            <div class="info">
                <div class="user">
                    <div class="nickname">{{comment.user.nickname}}</div>
                    <div class="time"> {{comment.time | shortDate}}</div>
                </div>
                <div class="like">
                    <mu-button flat
                        small
                        @click="$emit('like', comment)">
                        <mu-icon left
                            :size="16"
                            :color="comment.liked ? 'secondary' : ''"
                            value="thumb_up"></mu-icon>
                        <span>{{comment.likedCount}}</span>
                    </mu-button>
                </div>
            </div>
            <div class="content">{{comment.content}}</div>
            <div class="reply">
                <div v-for="reply in comment.beReplied"
                    :key="'re' + reply.beRepliedCommentId"
                    class="comment-item">
                    <div class="avatar">
                        <mu-avatar>
                            <img :src="reply.user | avatarImgSrc">
                        </mu-avatar>
                    </div>
                    <div class="text">
                        <div class="info">
                            <div class="user">
                                <div class="nickname">{{reply.user.nickname}}</div>
                            </div>
                        </div>
                        <div class="content">{{reply.content}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { shortDate } from '@/util/formatter';
import { sizeImg, HiDpiPx } from '@/util/image';

export default {
    props: {
        comment: {
            required: true
        }
    },
    filters: {
        avatarImgSrc(user) {
            return sizeImg(user.avatarUrl, HiDpiPx(40));
        },
        shortDate
    }
};
</script>

<style lang="less">
.comment-item {
    display: flex;
    flex-direction: row;
    margin: 8px 10px;
    .avatar {
        font-size: 0;
        margin-right: 8px;
    }
    .text {
        flex-grow: 1;
        .info {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            .user {
                .nickname {
                    font-weight: bold;
                }
                .time {
                    font-size: 12px;
                    opacity: 0.7;
                }
            }
            .like {
                opacity: 0.85;
            }
        }
        .content {
            user-select: text;
            word-break: break-word;
        }
        .reply {
            .comment-item {
                padding: 6px;
                margin: 6px 0 0;
                background-color: rgba(0, 0, 0, 0.1);
            }
        }
    }
}
</style>

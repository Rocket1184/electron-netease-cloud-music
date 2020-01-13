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
                    <router-link class="nickname"
                        :to="{ name: 'user', params: { id: comment.user.userId } }"
                        tag="a">{{ comment.user.nickname }}</router-link>
                    <div class="time"> {{comment.time | longDate}}</div>
                </div>
                <div class="actions">
                    <mu-button v-if="canDelete"
                        flat
                        small
                        @click="$emit('delete', comment)">
                        <mu-icon left
                            :size="16"
                            value="delete"></mu-icon>
                        <span>删除</span>
                    </mu-button>
                    <mu-button flat
                        small
                        @click="$emit('reply', comment)">
                        <mu-icon left
                            :size="16"
                            value="reply"></mu-icon>
                        <span>回复</span>
                    </mu-button>
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
                                <router-link class="nickname"
                                    :to="{ name: 'user', params: { id: reply.user.userId } }"
                                    tag="a">{{ reply.user.nickname }}</router-link>
                            </div>
                        </div>
                        <div class="content">
                            <span v-if="reply.status === 0">{{reply.content}}</span>
                            <span v-else
                                class="deleted">评论已删除</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

import { longDate } from '@/util/formatter';
import { sizeImg, HiDpiPx } from '@/util/image';

export default {
    props: {
        comment: {
            required: true
        }
    },
    computed: {
        ...mapState(['user']),
        canDelete() {
            return this.user.loginValid && this.comment.user.userId === this.user.info.id;
        }
    },
    filters: {
        avatarImgSrc(user) {
            return sizeImg(user.avatarUrl, HiDpiPx(40));
        },
        longDate
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
                    color: inherit;
                }
                .time {
                    font-size: 12px;
                    opacity: 0.7;
                }
            }
            .actions {
                opacity: 0.85;
                button {
                    min-width: 50px;
                }
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
                background-color: #0000000f;
                .deleted {
                    text-decoration: line-through;
                    opacity: 0.7;
                }
            }
        }
    }
}
</style>

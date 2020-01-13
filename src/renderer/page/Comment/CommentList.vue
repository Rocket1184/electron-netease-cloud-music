<template>
    <div class="comment-list">
        <CenteredLoading v-if="loading"></CenteredLoading>
        <CenteredTip v-else-if="comments.length === 0"
            icon="cloud_off"
            tip="暂无评论"></CenteredTip>
        <template v-else
            v-for="(cmt, index) in comments">
            <mu-divider v-if="index !== 0"
                :key="cmt.commentId + 'd'"></mu-divider>
            <CommentItem :key="cmt.commentId"
                :comment="cmt"
                @like="handleLike"
                @reply="handleReply"
                @delete="handleDelete"></CommentItem>
        </template>
        <div class="pagination"
            v-if="total > pageSize">
            <mu-button v-if="total === Infinity"
                flat
                @click="handleLoadMore">加载下一页<mu-icon value="chevron_right"></mu-icon>
            </mu-button>
            <mu-pagination v-else
                :total="total"
                :current="page"
                :page-size="pageSize"
                @change="handlePageChange">
            </mu-pagination>
        </div>
    </div>
</template>

<script>
import Api from '@/api/ipc';

import CommentItem from './CommentItem.vue';
import CenteredTip from '@/components/CenteredTip.vue';
import CenteredLoading from '@/components/CenteredLoading.vue';

export default {
    props: {
        thread: {
            type: String,
            required: true
        },
        comments: {
            type: Array,
            default: () => []
        },
        total: {
            type: Number,
            default: 0
        },
        loading: {
            type: Boolean,
            default: false
        },
        pageSize: {
            type: Number,
            required: false,
            default: 15
        }
    },
    data() {
        return {
            page: 1
        };
    },
    methods: {
        async handleLike(comment) {
            const requestLike = comment.liked ? Api.unlikeCommentE : Api.likeCommentE;
            const resp = await requestLike(this.thread, comment.commentId);
            if (resp.code === 200) {
                comment.liked = !comment.liked;
                comment.likedCount += comment.liked ? 1 : -1;
            }
        },
        async handleDelete({ commentId }) {
            const confirm = await this.$confirm('真的要删除此条评论吗？', '删除评论');
            if (confirm.result !== true) return;
            const resp = await Api.deleteComment(this.thread, commentId);
            if (resp.code === 200) {
                this.$toast.message('删除评论成功');
                const index = this.comments.findIndex(cmt => cmt.commentId === commentId);
                this.comments.splice(index, 1);
            } else {
                this.$toast.message(`删除评论失败 ... ${resp.code}: ${resp.msg}`);
            }
        },
        handleReply(comment) {
            this.$emit('reply', comment);
        },
        handleLoadMore() {
            this.page = 2;
            /** page, limit, offset */
            this.$emit('page', 2, this.pageSize, this.pageSize);
        },
        handlePageChange(page) {
            this.page = page;
            const offset = (page - 1) * this.pageSize;
            /** page, limit, offset */
            this.$emit('page', page, this.pageSize, offset);
        }
    },
    components: {
        CommentItem,
        CenteredTip,
        CenteredLoading
    }
};
</script>

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
            <mu-pagination :total="total"
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
        type: {
            type: String,
            required: false,
            default: 'all'
        },
        thread: {
            type: String,
            required: true
        },
        pageSize: {
            type: Number,
            required: false,
            default: 30
        }
    },
    data() {
        return {
            loading: false,
            page: 1,
            comments: [],
            total: 0
        };
    },
    computed: {
        offset() { return (this.page - 1) * this.pageSize; }
    },
    methods: {
        getComments(limit, offset) {
            if (this.type === 'hot') {
                return Api.getHotComments(this.thread, limit, offset);
            } else if (this.type === 'all') {
                return Api.getComments(this.thread, limit, offset);
            }
        },
        likeComment(commentId, liked) {
            if (liked === true) {
                return Api.unlikeCommentE(this.thread, commentId);
            } else {
                return Api.likeCommentE(this.thread, commentId);
            }
        },
        deleteComment(commentId) {
            return Api.deleteComment(this.thread, commentId);
        },
        async loadComments() {
            this.loading = true;
            const resp = await this.getComments(this.pageSize, this.offset);
            if (resp.code === 200) {
                this.total = resp.total;
                this.comments = resp.comments || resp.hotComments || [];
            }
            this.loading = false;
        },
        async handleLike(comment) {
            const resp = await this.likeComment(comment.commentId, comment.liked);
            if (resp.code === 200) {
                comment.liked = !comment.liked;
                comment.likedCount += comment.liked ? 1 : -1;
            }
        },
        async handleDelete({ commentId }) {
            const confirm = await this.$confirm('真的要删除此条评论吗？', '删除评论');
            if (confirm.result !== true) return;
            const resp = await this.deleteComment(commentId);
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
        async handlePageChange(val) {
            this.page = val;
            this.loadComments();
        }
    },
    watch: {
        thread() {
            this.total = 0;
            this.loadComments();
        }
    },
    created() {
        this.loadComments();
    },
    components: {
        CommentItem,
        CenteredTip,
        CenteredLoading
    }
};
</script>

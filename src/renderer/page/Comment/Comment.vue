<template>
    <ListDetailLayout class="ncm-page comment"
        showBack
        :detailLoading="false">
        <mu-tabs inverse
            :value="tab"
            @change="handleTabChange">
            <mu-tab value="hot">热门评论</mu-tab>
            <mu-tab value="all">全部评论</mu-tab>
            <mu-button flat
                class="btn-compose"
                @click="handleCompose">
                <mu-icon left
                    value="edit"></mu-icon>
                <span>写评论</span>
            </mu-button>
        </mu-tabs>
        <div class="list-wrapper">
            <transition :name="transitionName"
                mode="out-in">
                <keep-alive>
                    <CommentList :key="tab"
                        :thread="thread"
                        v-bind="comment[tab]"
                        @page="loadComments"
                        @reply="handleReply"></CommentList>
                </keep-alive>
            </transition>
        </div>
        <mu-dialog dialog-class="comment-editor-dlg"
            :open.sync="editorOpen"
            title="写评论">
            <mu-text-field id="comment-textarea"
                v-model="editorContent"
                :placeholder="editorPlaceholder"
                multi-line
                full-width
                :rows="3"
                :rows-max="6"></mu-text-field>
            <template #actions>
                <mu-button flat
                    @click="toggleEditor">取消</mu-button>
                <mu-button flat
                    color="primary"
                    :disabled="posting"
                    @click="postComment">发布</mu-button>
            </template>
        </mu-dialog>
    </ListDetailLayout>
</template>

<script>
import { mapState } from 'vuex';

import Api from '@/api/ipc';
import CommentList from './CommentList.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

const ThreadPrefix = {
    song: 'R_SO_4_',
    album: 'R_AL_3_',
    playlist: 'A_PL_0_',
    mv: 'R_MV_5_',
    video: 'R_VI_62_',
    dj: 'A_DJ_1_'
};

export default {
    props: {
        type: {
            type: String,
            required: true
        },
        id: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            tab: 'hot',
            comment: {
                all: { comments: [], total: 0, loading: false },
                hot: { comments: [], total: 0, loading: false }
            },
            transitionName: '',
            replyTo: -1,
            editorOpen: false,
            editorPlaceholder: '请输入评论内容 ヽ( ^∀^)ﾉ',
            editorContent: '',
            posting: false
        };
    },
    computed: {
        ...mapState(['user']),
        thread() {
            return ThreadPrefix[this.type] + this.id;
        }
    },
    methods: {
        async initComments() {
            const { all, hot } = this.comment;
            if (all.comments.length === 0 && hot.comments.length === 0) {
                all.loading = true;
                hot.loading = true;
                const resp = await Api.getComments(this.thread, 15, 0);
                all.loading = false;
                hot.loading = false;
                if (resp.code === 200) {
                    all.comments = resp.comments;
                    all.total = resp.total;
                    hot.comments = resp.hotComments;
                    hot.total = resp.moreHot ? Infinity : resp.hotComments.length;
                    if (hot.comments.length === 0 && this.tab === 'hot') {
                        this.transitionName = '';
                        this.tab = 'all';
                    }
                }
            }
        },
        async loadComments(page, limit, offset) {
            let model, requestComments;
            if (this.tab === 'hot') {
                model = this.comment.hot;
                requestComments = Api.getHotComments;
            } else if (this.tab === 'all') {
                model = this.comment.all;
                requestComments = Api.getComments;
            }
            if (model && requestComments) {
                if (model.total === Infinity) model.total = 0;
                model.loading = true;
                const resp = await requestComments(this.thread, limit, offset);
                model.loading = false;
                if (resp.code === 200) {
                    model.total = resp.total;
                    model.comments = resp.comments || resp.hotComments || [];
                } else {
                    model.comments = [];
                }
            }
        },
        handleTabChange(value) {
            this.tab = value;
            this.transitionName = value === 'hot' ? 'slide-right' : 'slide-left';
        },
        toggleEditor() {
            this.editorOpen = !this.editorOpen;
            if (this.editorOpen === true) {
                setTimeout(() => {
                    document.getElementById('comment-textarea').focus();
                }, 100);
            }
        },
        handleCompose() {
            if (!this.user.loginValid) {
                this.$toast.message('登录后才能发布评论呢 (,,Ծ‸Ծ,,)');
                return;
            }
            this.replyTo = -1;
            this.editorContent = '';
            this.editorPlaceholder = '请输入评论内容 ヽ( ^∀^)ﾉ';
            this.toggleEditor();
        },
        handleReply(comment) {
            if (!this.user.loginValid) {
                this.$toast.message('登录后才能回复评论呢 └(￣^￣ )┐');
                return;
            }
            this.replyTo = comment.commentId;
            this.editorContent = '';
            this.editorPlaceholder = `回复 @${comment.user.nickname}:`;
            this.toggleEditor();
        },
        async postComment() {
            if (this.editorContent.length === 0) {
                this.$toast.message('评论内容不能为空   (￣﹁￣)');
            }
            let resp;
            this.posting = true;
            if (this.replyTo > 0) {
                resp = await Api.replyCommentE(this.thread, this.replyTo, this.editorContent);
            } else {
                resp = await Api.addComment(this.thread, this.editorContent);
            }
            this.posting = false;
            if (resp.code === 200) {
                this.editorOpen = false;
                this.tab = 'all';
                this.loadComments();
            } else {
                this.$toast.message(`发布评论失败 ...  ${resp.code}: ${resp.msg}`);
            }
        }
    },
    watch: {
        thread() {
            this.comment = {
                all: { comments: [], total: 0, loading: false },
                hot: { comments: [], total: 0, loading: false }
            };
            this.initComments();
        }
    },
    mounted() {
        this.initComments();
    },
    components: {
        CommentList,
        ListDetailLayout
    }
};
</script>

<style lang="less">
.comment {
    user-select: none;
    .mu-tabs.mu-tabs-inverse {
        box-shadow: 0 0px 6px rgba(0, 0, 0, 0.4);
        background-color: transparent;
        z-index: unset;
        .btn-compose {
            margin-left: auto;
            margin-right: 6px;
        }
    }
    .list-wrapper {
        overflow-x: hidden;
        height: calc(~'100vh - 176px');
        .centered-loading,
        .centered-tip {
            height: calc(~'100vh - 248px');
        }
        .pagination {
            margin: 20px;
        }
    }
}
.comment-editor-dlg {
    width: 500px;
    .mu-input.full-width {
        margin: 0;
        padding: 0;
    }
}
</style>

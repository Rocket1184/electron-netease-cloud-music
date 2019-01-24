<template>
    <ListDetailLayout class="ncm-page comment"
        :detailLoading="false">
        <mu-list slot="list">
            <ListItemBack></ListItemBack>
        </mu-list>
        <div slot="detail">
            <mu-tabs inverse
                :value.sync="tab">
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
                            :ref="tab"
                            :pageSize="pageSize"
                            :getComments="getComments"
                            :likeComment="likeComment"
                            :deleteComment="deleteComment"
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
                <mu-button slot="actions"
                    flat
                    @click="toggleEditor">取消</mu-button>
                <mu-button slot="actions"
                    flat
                    color="primary"
                    :disabled="posting"
                    @click="postComment">发布</mu-button>
            </mu-dialog>
        </div>
    </ListDetailLayout>
</template>

<script>
import Api from '@/util/api';

import CommentList from './CommentList.vue';
import ListItemBack from '@/components/ListItemBack.vue';
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
    data() {
        return {
            thread: '',
            tab: 'hot',
            replyTo: -1,
            editorOpen: false,
            editorPlaceholder: '请输入评论内容 ヽ( ^∀^)ﾉ',
            editorContent: '',
            posting: false,
            pageSize: 30
        };
    },
    computed: {
        transitionName() {
            if (this.tab === 'hot') return 'slide-right';
            return 'slide-left';
        },
        getComments() {
            if (this.tab === 'hot') return this.getHotComments;
            return this.getAllComments;
        }
    },
    methods: {
        getHotComments(limit = 30, offset = 0) {
            return Api.getHotComments(this.thread, limit, offset);
        },
        getAllComments(limit = 30, offset = 0) {
            return Api.getComments(this.thread, limit, offset);
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
        toggleEditor() {
            this.editorOpen = !this.editorOpen;
            if (this.editorOpen === true) {
                setTimeout(() => {
                    document.getElementById('comment-textarea').focus();
                }, 100);
            }
        },
        handleCompose() {
            this.replyTo = -1;
            this.editorContent = '';
            this.editorPlaceholder = '请输入评论内容 ヽ( ^∀^)ﾉ';
            this.toggleEditor();
        },
        handleReply(comment) {
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
                this.$refs.all.loadComments();
            } else {
                this.$toast.message(`发布评论失败 ...  ${resp.code}: ${resp.msg}`);
            }
        }
    },
    created() {
        const { id, type } = this.$route.params;
        this.thread = `${ThreadPrefix[type]}${id}`;
    },
    components: {
        CommentList,
        ListItemBack,
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
            justify-self: flex-end;
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

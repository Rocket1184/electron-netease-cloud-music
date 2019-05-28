<template>
    <ListDetailLayout class="ncm-page comment"
        showBack
        :detailLoading="false">
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
                        :type="tab"
                        :thread="thread"
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
    data() {
        return {
            tab: 'hot',
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
            const { id, type } = this.$route.params;
            return `${ThreadPrefix[type]}${id}`;
        },
        transitionName() {
            if (this.tab === 'hot') return 'slide-right';
            return 'slide-left';
        }
    },
    methods: {
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
                this.$refs.all.loadComments();
            } else {
                this.$toast.message(`发布评论失败 ...  ${resp.code}: ${resp.msg}`);
            }
        }
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

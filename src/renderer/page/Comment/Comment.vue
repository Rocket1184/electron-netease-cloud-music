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
            </mu-tabs>
            <div class="list-wrapper">
                <transition :name="transitionName"
                    mode="out-in">
                    <keep-alive>
                        <CommentList :key="tab"
                            :pageSize="pageSize"
                            :getComments="getComments"
                            :likeComment="likeComment"></CommentList>
                    </keep-alive>
                </transition>
            </div>
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
    fm: 'A_DJ_1_'
};

export default {
    data() {
        return {
            thread: '',
            tab: 'hot',
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
        likeComment(commentId, like) {
            if (like === true) {
                return Api.unlikeComment(this.thread, commentId);
            } else {
                return Api.likeComment(this.thread, commentId);
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
        background-color: transparent;
    }
    .list-wrapper {
        overflow-x: hidden;
        .centered-loading {
            height: 300px;
        }
        .pagination {
            padding: 16px;
        }
    }
}
</style>

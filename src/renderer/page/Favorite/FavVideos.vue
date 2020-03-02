<template>
    <ListDetailLayout class="fav-video"
        :listLoading="listLoading"
        :detailLoading="detailLoading"
        tipText="登录后查看收藏的视频"
        :showTip="!user.loginValid">
        <template #list>
            <mu-list>
                <AvatarListItem v-for="v in user.videos"
                    :key="v.id"
                    :img="v.picUrl"
                    :title="v.name"
                    :subTitle="v.creator.map(i => i.name).join(' / ')"
                    @click="handleClick(v.id, v.type)">
                </AvatarListItem>
            </mu-list>
        </template>
        <VideoDetail v-if="video" :video="video"></VideoDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { getVideoDetail } from '@/api/typed';

import VideoDetail from '@/components/VideoDetail/VideoDetail.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

import { FetchOnLoginMixin } from './fetch-on-login';

export default {
    mixins: [FetchOnLoginMixin],
    data() {
        return {
            video: null,
            listLoading: false,
            detailLoading: false,
            pausedWhenEnter: null
        };
    },
    computed: {
        ...mapState(['ui', 'user']),
    },
    methods: {
        ...mapActions([
            'updateUserVideos',
            'pauseAudio',
            'playAudio'
        ]),
        async loadVideo(id, type) {
            this.detailLoading = true;
            this.video = await getVideoDetail(id, type);
            this.detailLoading = false;
            this.$nextTick(() => {
                const vid = this.$el.querySelector('video');
                if (vid) {
                    vid.addEventListener('play', () => {
                        if (!this.ui.paused) this.pauseAudio();
                    });
                }
            });
        },
        async fetchData() {
            if (this.user.videos.length <= 0) {
                this.listLoading = true;
                await this.updateUserVideos();
                this.listLoading = false;
            }
            const v = this.user.videos[0];
            if (v && v.id) {
                this.loadVideo(v.id, v.type);
            }
        },
        handleClick(id, type) {
            this.loadVideo(id, type);
        }
    },
    mounted() {
        this.pausedWhenEnter = this.ui.paused;
    },
    activated() {
        this.pausedWhenEnter = this.ui.paused;
    },
    deactivated() {
        if (!this.pausedWhenEnter) {
            this.playAudio();
        }
        this.pausedWhenEnter = null;
    },
    components: {
        VideoDetail,
        AvatarListItem,
        ListDetailLayout
    }
};
</script>

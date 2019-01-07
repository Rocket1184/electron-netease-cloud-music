<template>
    <ListDetailLayout :loading="detailLoading"
        tipText="登录后查看收藏的歌单"
        :showTip="false">
        <mu-list slot="list">
            <mu-list-item button
                @click="handleBack">
                <mu-list-item-action>
                    <mu-icon size="24"
                        value="arrow_back"></mu-icon>
                </mu-list-item-action>
                <mu-list-item-title>返回</mu-list-item-title>
            </mu-list-item>
        </mu-list>
        <PlaylistDetail slot="detail"
            v-if="!detailLoading"
            :playlist="ui.temp.playlist"
            @detail-scroll="scrollContent"></PlaylistDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import ListDetailLayout from '@/components/ListDetailLayout.vue';
import PlaylistDetail from '@/components/playlistDetail.vue';

export default {
    data() {
        return {
            detailLoading: true
        };
    },
    computed: {
        ...mapState(['ui'])
    },
    methods: {
        ...mapActions([
            'setUiPlaylistDetail'
        ]),
        handleBack() {
            this.$router.back();
        },
        async loadPlaylist(id) {
            this.detailLoading = true;
            await this.setUiPlaylistDetail(id);
            this.detailLoading = false;
        },
        /**
         * @param {number} top
         * @param {ScrollBehavior} behavior
         */
        scrollContent(top, behavior = 'smooth') {
            document.querySelector('.ld-detail').scrollTo({ top, behavior });
        }
    },
    mounted() {
        const id = this.$route.params.id;
        this.loadPlaylist(id);
    },
    components: {
        ListDetailLayout,
        PlaylistDetail
    }
};
</script>

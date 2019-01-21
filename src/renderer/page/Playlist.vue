<template>
    <ListDetailLayout :detailLoading="detailLoading">
        <div slot="list"
            class="playlist-side">
            <mu-list>
                <ListItemBack></ListItemBack>
            </mu-list>
            <div class="related">
                <mu-list>
                    <mu-list-item>相关推荐</mu-list-item>
                    <div v-if="relatedLoading"
                        class="progress-wrapper">
                        <mu-circular-progress color="secondary"
                            :size="60"
                            :stroke-width="5"></mu-circular-progress>
                    </div>
                    <AvatarListItem v-else
                        v-for="list in ui.temp.relatedPlaylists"
                        :key="list.id"
                        :img="list.picUrl"
                        :title="list.name"
                        :subTitle="list.creator.name"
                        @click="handleRelatedClick(list.id)"></AvatarListItem>
                </mu-list>
            </div>
        </div>
        <PlaylistDetail slot="detail"
            v-if="!detailLoading"
            :playlist="ui.temp.playlist"
            @detail-scroll="scrollContent"></PlaylistDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import ListDetailLayout from '@/components/ListDetailLayout.vue';
import PlaylistDetail from '@/components/PlaylistDetail.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';
import ListItemBack from '@/components/ListItemBack.vue';

export default {
    data() {
        return {
            detailLoading: true,
            relatedLoading: true
        };
    },
    computed: {
        ...mapState(['ui'])
    },
    methods: {
        ...mapActions([
            'setUiTempPlaylist',
            'setUiRelatedPlaylists'
        ]),
        loadPlaylist() {
            const id = this.$route.params.id;
            if (this.ui.temp.playlist && id == this.ui.temp.playlist.id) {
                this.detailLoading = false;
                this.relatedLoading = false;
                return;
            }
            this.detailLoading = true;
            this.relatedLoading = true;
            this.setUiTempPlaylist(id)
                .then(() => this.detailLoading = false);
            this.setUiRelatedPlaylists(id)
                .then(() => this.relatedLoading = false);
        },
        /**
         * @param {number} top
         * @param {ScrollBehavior} behavior
         */
        scrollContent(top, behavior = 'smooth') {
            document.querySelector('.ld-detail').scrollTo({ top, behavior });
        },
        handleRelatedClick(id) {
            this.$router.push({ name: 'playlist', params: { id } });
        }
    },
    mounted() {
        this.loadPlaylist();
    },
    beforeRouteUpdate(to, from, next) {
        // this component is reused in the new route
        next();
        this.loadPlaylist();
    },
    components: {
        ListDetailLayout,
        PlaylistDetail,
        AvatarListItem,
        ListItemBack
    }
};
</script>

<style lang="less">
.playlist-side {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
    .related {
        .progress-wrapper {
            height: 280px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}
</style>

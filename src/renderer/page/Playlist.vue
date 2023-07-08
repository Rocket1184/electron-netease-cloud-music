<template>
    <ListDetailLayout class="ncm-page playlist-detail"
        showBack
        :detailLoading="detailLoading">
        <template #list>
            <mu-list class="related">
                <mu-list-item>相关推荐</mu-list-item>
                <div v-if="relatedLoading"
                    class="progress-wrapper">
                    <mu-circular-progress color="secondary"
                        :size="60"
                        :stroke-width="5"></mu-circular-progress>
                </div>
                <AvatarListItem v-else
                    v-for="list in related"
                    :key="list.id"
                    :img="list.picUrl"
                    :title="list.name"
                    :subTitle="list.creator.name"
                    @click="handleRelatedClick(list.id)"></AvatarListItem>
            </mu-list>
        </template>
        <PlaylistDetail :playlist="playlist"></PlaylistDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions } from 'vuex';

import Api from '@/api/ipc';
import { getPlaylistDetail } from '@/api/typed';

import ListDetailLayout from '@/components/ListDetailLayout.vue';
import PlaylistDetail from '@/components/PlaylistDetail.vue';
import AvatarListItem from '@/components/AvatarListItem.vue';

export default {
    props: {
        id: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            playlist: null,
            related: [],
            detailLoading: true,
            relatedLoading: true
        };
    },
    methods: {
        ...mapActions([
            'updateUserPlaylistDetail'
        ]),
        loadPlaylist() {
            this.detailLoading = true;
            this.relatedLoading = true;
            getPlaylistDetail(this.id).then(playlist => {
                this.playlist = playlist;
                this.detailLoading = false;
                this.updateUserPlaylistDetail(playlist);
            });
            Api.getRelatedPlaylists(this.id).then(resp => {
                if (resp.code === 200) {
                    this.related = resp.data;
                }
                this.relatedLoading = false;
            });
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
        this.$nextTick(() => this.loadPlaylist());
    },
    components: {
        ListDetailLayout,
        PlaylistDetail,
        AvatarListItem
    }
};
</script>

<style lang="less">
.playlist-detail {
    .related {
        margin-top: auto;
        .progress-wrapper {
            height: 280px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}
</style>

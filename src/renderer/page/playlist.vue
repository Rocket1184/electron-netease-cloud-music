<template>
    <div class="myplaylist">
        <div class="aside">
            <div v-if="!loginValid"
                class="tip">
                <mu-icon value="nature_people"
                    color="grey"
                    :size="128"></mu-icon>
                <p>登录后查看创建/收藏的歌单</p>
            </div>
            <mu-list v-else
                toggle-nested
                :nested-indent="false">
                <template v-for="group in listGroups">
                    <mu-list-item button
                        nested
                        :key="group.name"
                        :open="group.open"
                        @click="group.open = !group.open">
                        <mu-list-item-title>{{group.name}}</mu-list-item-title>
                        <mu-list-item-action>
                            <mu-icon class="toggle-icon"
                                size="24"
                                value="keyboard_arrow_down"></mu-icon>
                        </mu-list-item-action>
                        <template v-for="(list, index) in group.lists">
                            <PlaylistItem :key="index"
                                :item="list"
                                slot="nested"
                                @click="navigateToList(list.id)"></PlaylistItem>
                        </template>
                    </mu-list-item>
                </template>
            </mu-list>
        </div>
        <div class="content">
            <PlaylistDetail v-if="detail"
                :detail="detail"
                @detail-scroll="scrollContent"></PlaylistDetail>
            <div v-if="loading"
                class="loading">
                <mu-circular-progress color="secondary"
                    :size="60"
                    :stroke-width="5"></mu-circular-progress>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import { PlayList } from '@/util/models';
import ApiRenderer from '@/util/apiRenderer';
import PlaylistItem from '@/components/myPlaylistItem.vue';
import PlaylistDetail from '@/components/playlistDetail.vue';
import { SET_USER_PLAYLISTS } from '@/vuex/mutation-types';

export default {
    name: 'page-playlist',
    data() {
        return {
            detail: null,
            loading: false
        };
    },
    computed: {
        ...mapGetters(['user', 'loginValid']),
        listGroups() {
            if (!this.loginValid) return [];
            return [
                {
                    name: '创建的歌单',
                    open: true,
                    lists: this.user.playlist.filter(e => e.creator.id == this.user.id)
                },
                {
                    name: '收藏的歌单',
                    open: true,
                    lists: this.user.playlist.filter(e => e.creator.id != this.user.id)
                }
            ];
        }
    },
    methods: {
        ...mapActions(['refreshUserPlaylist']),
        /**
         * @param {number} top
         * @param {ScrollBehavior} behavior
         */
        scrollContent(top, behavior = 'smooth') {
            document.querySelector('.myplaylist .content').scrollTo({ top, behavior });
        },
        async loadUserPlaylist(id) {
            // if there's any 'cached' playlist, display it first
            this.detail = this.user.playlist.find(p => p.id == id);
            await this.refreshUserPlaylist(id);
            this.detail = this.user.playlist.find(p => p.id == id);
        },
        async loadExternalPlaylist(id) {
            this.detail = null;
            this.loading = true;
            this.detail = new PlayList((await ApiRenderer.getListDetail(id)).playlist);
            this.loading = false;
        },
        loadPlaylist(id) {
            this.scrollContent(0, 'instant');
            if (this.loginValid && this.user.playlist.find(p => p.id == id)) {
                this.loadUserPlaylist(id);
                return;
            }
            this.loadExternalPlaylist(id);
        },
        navigateToList(id) {
            this.$router.push(`/playlist/${id}`);
            this.loadPlaylist(id);
        },
        initDetails() {
            let id;
            try {
                id = +this.$route.params.id || this.user.favoriteList.id;
            } catch (e) {
                // maybe loginValid is still `false`, user playlists unavailable
                return;
            }
            this.navigateToList(id);
        }
    },
    mounted() {
        if (!this.loginValid) {
            this.$store.subscribe((mutation) => {
                if (mutation.type === SET_USER_PLAYLISTS) {
                    if (this.$route.path.startsWith('/playlist') && !this.detail) {
                        this.initDetails();
                    }
                }
            });
        }
        this.initDetails();
    },
    activated() {
        this.initDetails();
    },
    components: {
        PlaylistItem,
        PlaylistDetail
    }
};
</script>

<style lang="less">
.myplaylist {
    display: flex;
    flex-direction: row;
    height: 100%;
    .aside {
        flex: 1;
        height: 100%;
        overflow: auto;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
        .tip {
            height: 100%;
            color: grey;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
    }
    .content {
        flex: 3;
        height: 100%;
        overflow: auto;
        .loading {
            display: flex;
            height: 100%;
            justify-content: center;
            align-items: center;
        }
        .loading-wrapper {
            height: 200px;
        }
    }
}
</style>

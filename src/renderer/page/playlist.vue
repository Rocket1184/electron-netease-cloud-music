<template>
    <div class="myplaylist">
        <template v-if="loginValid">
            <div class="aside">
                <mu-list toggle-nested
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
                                    @click="loadPlaylist(list.id)"></PlaylistItem>
                            </template>
                        </mu-list-item>
                    </template>
                </mu-list>
            </div>
            <div class="content">
                <PlaylistDetail v-if="detail"
                    :detail="detail"
                    @detail-scroll="scrollContent"></PlaylistDetail>
            </div>
        </template>
        <div v-else
            class="tip">
            <mu-icon value="nature_people"
                color="grey"
                :size="128"></mu-icon>
            <p>登录后查看创建/收藏的歌单</p>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import PlaylistItem from '@/components/myPlaylistItem.vue';
import PlaylistDetail from '@/components/playlistDetail.vue';
import { SET_USER_PLAYLISTS } from '@/vuex/mutation-types';

export default {
    name: 'page-playlist',
    data() {
        return {
            listGroups: [],
            detail: null
        };
    },
    computed: {
        ...mapGetters(['user', 'loginValid'])
    },
    methods: {
        ...mapActions(['refreshUserPlaylist']),
        updateListGroups() {
            this.listGroups = [
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
        },
        async loadPlaylist(id) {
            this.scrollContent(0);
            this.detail = this.user.playlist.find(p => p.id === id);
            await this.refreshUserPlaylist(id);
            const target = this.user.playlist.find(p => p.id === id);
            if (target) {
                this.detail = target;
            }
        },
        scrollContent(top) {
            document.querySelector('.myplaylist .content').scrollTo({ top, behavior: 'smooth' });
        }
    },
    mounted() {
        if (this.loginValid) {
            this.updateListGroups();
            this.loadPlaylist(this.user.playlist[0].id);
        } else {
            this.$store.subscribe((mutation) => {
                if (mutation.type === SET_USER_PLAYLISTS) {
                    this.updateListGroups();
                    this.loadPlaylist(this.user.playlist[0].id);
                }
            });
        }
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
    }
    .content {
        flex: 3;
        height: 100%;
        overflow: auto;
        .loading-wrapper {
            height: 200px;
        }
    }
    .tip {
        flex-grow: 1;
        color: grey;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
}
</style>

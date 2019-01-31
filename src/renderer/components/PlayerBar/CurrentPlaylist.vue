<template>
    <div class="current-list">
        <CenteredTip v-if="playlist.list.length === 0"
            tip="列表里什么都没有，快去找几首歌吧 φ(≧ω≦*)♪"
            icon="music_note"></CenteredTip>
        <template v-else>
            <div class="actions">
                <span class="count">共 {{playlist.list.length}} 首</span>
                <mu-button flat
                    small
                    @click="handleCollectAll">
                    <mu-icon left
                        value="library_add"></mu-icon>
                    <span>收藏全部</span>
                </mu-button>
                <mu-button flat
                    small
                    @click="handleClearPlaylist">
                    <mu-icon left
                        value="delete_sweep"></mu-icon>
                    <span>清空列表</span>
                </mu-button>
            </div>
            <mu-list dense
                class="list">
                <mu-list-item v-for="(track, index) in playlist.list"
                    button
                    :key="track.id"
                    :id="`cur-list-${index}`"
                    @click="handleListClick(index)">
                    <mu-list-item-action>
                        <mu-icon v-if="track.id == playingId"
                            color="secondary"
                            value="volume_up"
                            :size="18">
                        </mu-icon>
                        <span v-else>{{index + 1}}</span>
                    </mu-list-item-action>
                    <mu-list-item-title>
                        {{track.name}}
                        <span class="track-artist mu-item-after-text"> - {{track.artistName}}</span>
                    </mu-list-item-title>
                    <mu-list-item-action class="current-list-after">
                        <mu-icon value="close"
                            title="从列表中删除"
                            @click.stop="handleRemove(index)"></mu-icon>
                        <mu-icon v-if="track.source"
                            value="link"
                            :title="sourceTipText(track)"
                            @click.stop="handleSourceClick(track.source)"></mu-icon>
                    </mu-list-item-action>
                </mu-list-item>
            </mu-list>
        </template>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import CenteredTip from '@/components/CenteredTip.vue';

const SourceName = {
    list: '歌单',
    album: '专辑',
    artist: '歌手',
    search: '搜索'
};

const RouteName = {
    list: 'playlist',
    album: 'album',
    artist: 'artist',
    search: 'search'
};

export default {
    computed: {
        ...mapState(['playlist']),
        playingId() {
            const { list, index } = this.playlist;
            return list[index].id;
        }
    },
    methods: {
        ...mapActions([
            'clearPlaylist',
            'playTrackIndex',
            'toggleCollectPopup',
            'removeTrackFromPlaylist'
        ]),
        handleCollectAll() {
            const ids = this.playlist.list.map(t => t.id);
            this.toggleCollectPopup(ids);
        },
        async handleClearPlaylist() {
            const msg = await this.$confirm('真的要清空播放列表吗？', '提示');
            if (msg.result === true) {
                this.clearPlaylist();
            }
        },
        handleListClick(index) {
            this.playTrackIndex(index);
        },
        sourceTipText(track) {
            return `来自${SourceName[track.source.name]}`;
        },
        handleSourceClick(source) {
            const name = RouteName[source.name];
            switch (source.name) {
                case 'list':
                case 'album':
                case 'artist':
                    this.$router.push({ name, params: { id: source.id } });
                    break;
                case 'search':
                    this.$router.push({ name, query: { keyword: source.id, type: 'song' } });
                    break;
                default:
                    break;
            }
            this.$emit('navigate');
        },
        handleRemove(index) {
            this.removeTrackFromPlaylist({ start: index, count: 1 });
        }
    },
    components: {
        CenteredTip
    }
};
</script>

<style lang="less">
.current-list {
    height: 100%;
    .actions {
        height: 36px;
        padding: 0 8px;
        display: flex;
        align-items: center;
        opacity: 0.75;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        .count {
            margin-left: 8px;
            flex-grow: 1;
        }
    }
    .list {
        padding: 0;
        height: calc(~'100% - 36px');
        .mu-item {
            padding-right: 8px;
            .mu-item-action {
                z-index: 1;
                width: 36px;
                min-width: 0;
            }
            .track-artist {
                font-size: 11px;
            }
            .current-list-after {
                opacity: 0;
                min-width: 50px;
                flex-direction: row-reverse;
            }
            &:hover {
                .current-list-after {
                    opacity: 0.6;
                }
            }
        }
    }
}
</style>

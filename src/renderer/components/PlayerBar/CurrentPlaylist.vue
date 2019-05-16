<template>
    <div class="current-list">
        <CenteredTip v-if="queueEmpty"
            tip="列表里什么都没有，快去找几首歌吧 φ(≧ω≦*)♪"
            icon="music_note"></CenteredTip>
        <template v-else>
            <div class="actions">
                <span class="count">{{titleText}}</span>
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
            <mu-list dense>
                <mu-list-item v-for="(track, index) in queue.list"
                    button
                    :key="track.id"
                    :id="`cur-list-${index}`"
                    @click="handleListClick(index)">
                    <mu-list-item-action>
                        <mu-icon v-if="track.id == playing.id"
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
                    <mu-list-item-action v-if="!ui.radioMode"
                        class="current-list-after">
                        <mu-icon v-if="track.source"
                            value="link"
                            :size="22"
                            :title="sourceTipText(track)"
                            @click.stop="handleSourceClick(track.source)"></mu-icon>
                        <mu-icon value="close"
                            :size="22"
                            title="从列表中删除"
                            @click.stop="handleRemove(index)"></mu-icon>
                    </mu-list-item-action>
                </mu-list-item>
            </mu-list>
        </template>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import CenteredTip from '@/components/CenteredTip.vue';

const SourceName = {
    list: '歌单',
    album: '专辑',
    artist: '歌手',
    search: '搜索',
    radio: '私人 FM',
    recommend: '每日歌曲推荐'
};

const RouteName = {
    list: 'playlist',
    album: 'album',
    artist: 'artist',
    search: 'search',
    radio: 'radio',
    recommend: 'recommend'
};

export default {
    computed: {
        ...mapState(['ui']),
        ...mapGetters(['playing', 'queue']),
        queueEmpty() {
            return this.queue.list.length === 0;
        },
        titleText() {
            if (this.ui.radioMode) return '私人 FM';
            return `共 ${this.queue.list.length} 首`;
        }
    },
    methods: {
        ...mapActions([
            'clearPlaylist',
            'playTrackIndex',
            'toggleCollectPopup',
            'removeTrackFromPlaylist'
        ]),
        scrollTo(index) {
            const el = document.getElementById(`cur-list-${index}`);
            if (el) el.scrollIntoViewIfNeeded();
        },
        handleCollectAll() {
            const ids = this.queue.list.map(t => t.id);
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
                case 'radio':
                case 'recommend':
                    this.$router.push({ name });
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
        padding: 0 4px 0 12px;
        display: flex;
        align-items: center;
        opacity: 0.75;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        .count {
            margin-right: auto;
        }
        .mu-button-small {
            min-width: unset;
        }
    }
    .mu-list {
        padding: 0;
        height: calc(~'100% - 36px');
        .mu-item {
            padding: 0 4px;
            .mu-item-action {
                z-index: 1;
                min-width: 36px;
                justify-content: center;
            }
            .track-artist {
                font-size: 11px;
            }
            .current-list-after {
                opacity: 0;
                min-width: 50px;
                flex-direction: row;
                justify-content: flex-end;
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

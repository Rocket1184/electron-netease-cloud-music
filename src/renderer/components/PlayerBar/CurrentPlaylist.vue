<template>
    <div class="current-list">
        <CenteredTip v-if="playlist.list.length === 0"
            tip="列表里什么都没有，快去找几首歌吧 φ(≧ω≦*)♪"
            icon="music_note"></CenteredTip>
        <mu-list v-else
            dense
            class="list">
            <mu-list-item v-for="(track, index) in playlist.list"
                button
                :ripple="false"
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
                <mu-list-item-action v-if="track.source"
                    :title="sourceTipText(track)">
                    <mu-icon value="link"
                        @click="handleSourceClick($event, track.source)"></mu-icon>
                </mu-list-item-action>
            </mu-list-item>
        </mu-list>
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
        ...mapActions(['playTrackIndex']),
        handleListClick(index) {
            this.playTrackIndex(index);
        },
        sourceTipText(track) {
            return `来自${SourceName[track.source.name]}`;
        },
        handleSourceClick(ev, source) {
            ev.stopPropagation();
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
        }
    },
    components: {
        CenteredTip
    }
};
</script>

<style lang="less">
.current-list {
    height: inherit;
    .list {
        padding: 0;
        .mu-item-action {
            width: 36px;
            min-width: 0;
        }
        .track-artist {
            font-size: 11px;
        }
    }
}
</style>

<template>
    <div class="tracklist tracklist--virtual tracklist--dj">
        <CenteredTip v-if="programs.length === 0"
            icon="inbox"
            tip="没有歌曲  (ÒωÓױ)"></CenteredTip>
        <template v-else>
            <RecycleScroller class="list"
                page-mode
                :items="programs"
                :item-size="40"
                key-field="id">
                <template v-slot="{ item, index }">
                    <ncm-mu-dbclick-ripple class="track-row"
                        @dblclick="handlePlay(index)">
                        <div class="track-col index">{{total - index}}</div>
                        <div class="track-col name">{{item.mainSong.name}}</div>
                        <div class="track-col count">
                            <mu-icon value="headset"></mu-icon>{{item.listenerCount | humanCount}}
                        </div>
                        <div class="track-col duration">{{item.mainSong.duration | shortTime}}</div>
                        <div class="track-col buttons">
                            <mu-button icon
                                small
                                title="下一首播放"
                                @click="handleQueue(index)">
                                <mu-icon value="playlist_add"></mu-icon>
                            </mu-button>
                        </div>
                    </ncm-mu-dbclick-ripple>
                </template>
            </RecycleScroller>
        </template>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import CenteredTip from '@/components/CenteredTip.vue';
import { humanCount, shortTime } from '@/util/formatter';

export default {
    props: {
        total: {
            type: Number,
            required: true
        },
        programs: {
            type: Array,
            required: true
        }
    },
    computed: {
        ...mapState(['ui', 'playlist'])
    },
    methods: {
        ...mapActions([
            'playPlaylist',
            'activateRadio',
            'playTrackIndex',
            'insertTrackIntoPlaylist'
        ]),
        getProgramSource(prog) {
            return {
                name: 'djradio',
                id: prog.radio.id,
                djradio: {
                    id: prog.id,
                    createTime: prog.createTime,
                    description: prog.description,
                    radio: prog.radio,
                    dj: prog.dj
                }
            };
        },
        findTrackInPlaylist(track) {
            const id = track.id;
            return this.playlist.list.findIndex(t => t.id === id);
        },
        handleQueue(index) {
            if (this.ui.radioMode) {
                this.$toast.message('正在播放私人 FM，无法添加到播放列表');
                return;
            }
            const program = this.programs[index];
            if (this.findTrackInPlaylist(program.mainSong) > -1) {
                this.$toast.message('已经在播放列表中了  ( >﹏<。)～');
                return;
            }
            this.insertTrackIntoPlaylist({
                tracks: [program.mainSong],
                source: this.getProgramSource(program),
                index: this.playlist.index + 1
            });
            this.$toast.message('已添加下一首播放  _(:з」∠)_');
        },
        handlePlay(index) {
            if (this.ui.radioMode === true) {
                this.$toast.message('已退出私人 FM');
                this.activateRadio(false);
            }
            const program = this.programs[index];
            const i = this.findTrackInPlaylist(program.mainSong);
            if (i > -1) {
                this.playTrackIndex(i);
                return;
            }
            this.insertTrackIntoPlaylist({
                tracks: [program.mainSong],
                source: this.getProgramSource(program),
                index: this.playlist.index
            });
            const newIndex = this.findTrackInPlaylist(program.mainSong);
            this.playTrackIndex(newIndex);
        },
        playAll() {
            this.playPlaylist({
                tracks: this.programs.map(p => {
                    p.mainSong.source = this.getProgramSource(p);
                    return p.mainSong;
                })
            });
        }
    },
    filters: {
        shortTime,
        humanCount
    },
    components: {
        CenteredTip
    }
};
</script>

<style lang="less">
.tracklist--dj {
    .count {
        width: 70px;
        text-align: left;
        .mu-icon {
            height: 16px;
            width: 16px;
            font-size: 16px;
            color: grey;
            vertical-align: text-bottom;
        }
    }
}
</style>

<template>
    <div class="tracklist tracklist--virtual tracklist--dj">
        <mu-sub-header>
            <span>电台节目</span>
            <mu-text-field ref="findInput"
                v-model="findInput"
                placeholder="查找节目 ..."
                :action-icon="findInput.length > 0 ? 'close' : null"
                :action-click="clearFind"></mu-text-field>
        </mu-sub-header>
        <mu-divider></mu-divider>
        <CenteredTip v-if="programs.length === 0"
            icon="inbox"
            tip="没有歌曲  (ÒωÓױ)"></CenteredTip>
        <template v-else>
            <RecycleScroller page-mode
                :items="programsToShow"
                :item-size="40"
                key-field="id">
                <template v-slot="{ item, index }">
                    <ncm-mu-dbclick-ripple class="track-row"
                        @dblclick="handlePlay(index)">
                        <div class="track-col index">{{ total - (indexMap.get(index) || index) }}</div>
                        <div class="track-col name">{{ item.mainSong.name }}</div>
                        <div class="track-col count">
                            <mu-icon value="headset"></mu-icon>{{ item.listenerCount | humanCount }}
                        </div>
                        <div class="track-col duration">{{ item.mainSong.duration | shortTime }}</div>
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

import { workerExecute } from '@/worker/message';

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
    data() {
        return {
            findInput: '',
            filteredPrograms: [],
            indexMap: new Map()
        };
    },
    computed: {
        ...mapState(['ui', 'playlist']),
        programsToShow() {
            return this.findInput.length > 0 ? this.filteredPrograms : this.programs;
        }
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
                    radio: prog.radio
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
            const program = this.programs[this.indexMap.get(index) || index];
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
            const program = this.programs[this.indexMap.get(index) || index];
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
        },
        handleFind() {
            if (this.findInput.length > 0) {
                workerExecute('filterDjRadioPrograms', this.findInput, this.programs).then(res => {
                    this.filteredPrograms = res.result;
                    this.indexMap = res.indexMap;
                });
            } else {
                this.filteredPrograms = [];
                this.indexMap.clear();
            }
        },
        clearFind() {
            this.findInput = '';
            this.indexMap.clear();
            this.filteredPrograms = [];
        }
    },
    watch: {
        findInput() {
            this.handleFind();
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

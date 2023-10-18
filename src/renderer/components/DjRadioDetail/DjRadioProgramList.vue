<template>
    <div class="tracklist tracklist--virtual tracklist--dj">
        <div class="tracklist__header">
            <mu-button flat
                class="tracklist__play"
                :disabled="loadingAll"
                @click="playAll">
                <mu-icon left
                    :size="20"
                    color="grey"
                    value="play_circle_filled"></mu-icon>
                <span>{{ btnPlayText }}</span>
            </mu-button>
            <template v-if="programs.length < total">
                <div v-if="loadingAll"
                    class="djradio-loading">
                    <mu-circular-progress color="secondary"
                        :size="16"
                        :stroke-width="2"></mu-circular-progress>
                    <span>正在加载</span>
                </div>
                <mu-button v-else
                    flat
                    class="tracklist__play"
                    @click="loadAll">
                    <mu-icon left
                        :size="20"
                        color="grey"
                        value="autorenew"></mu-icon>
                    <span>加载全部</span>
                </mu-button>
            </template>
            <mu-text-field ref="findInput"
                v-model="findInput"
                placeholder="查找节目 ..."
                @keydown="handleInputKeyDown"
                :action-icon="findInput.length > 0 ? 'close' : null"
                :action-click="handleInputClear"></mu-text-field>
        </div>
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
                            <mu-icon value="headset"></mu-icon>{{ humanCount(item.listenerCount) }}
                        </div>
                        <div class="track-col duration">{{ shortTime(item.mainSong.duration) }}</div>
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
import { mapActions } from 'vuex';

import { workerExecute } from '@/worker/message';

import CenteredTip from '@/components/CenteredTip.vue';
import { humanCount, shortTime } from '@/util/formatter';

export default {
    props: {
        total: {
            type: Number,
            required: true
        },
        /** @type {Vue.PropOptions<Models.DjRadioProgram[]} */
        programs: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            loadingAll: false,
            findInput: '',
            filteredPrograms: null,
            indexMap: new Map()
        };
    },
    computed: {
        /** @returns {import('@/store/modules/ui').State} */
        ui() { return this.$store.state.ui; },
        /** @returns {import('@/store/modules/playlist').State}*/
        playlist() { return this.$store.state.playlist; },
        /** @returns {Models.DjRadioProgram[]} */
        programsToShow() {
            return this.filteredPrograms || this.programs;
        },
        /** @returns {string} */
        btnPlayText() {
            return `播放全部 (${this.total})`;
        }
    },
    methods: {
        shortTime,
        humanCount,
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
        async loadAll() {
            if (this.programs.length < this.total) {
                this.loadingAll = true;
                await new Promise(resolve => {
                    this.$emit('loadAll', resolve);
                });
                this.loadingAll = false;
            }
        },
        async playAll() {
            await this.loadAll();
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
                this.filteredPrograms = null;
                this.indexMap.clear();
            }
        },
        /** @param {KeyboardEvent} e */
        handleInputKeyDown(e) {
            if (e.key === 'Escape') {
                this.findInput = '';
                this.$refs.findInput.blur();
            }
        },
        handleInputClear() {
            this.findInput = '';
            this.$refs.findInput.focus();
        }
    },
    watch: {
        programs() {
            this.handleFind();
        },
        findInput() {
            this.handleFind();
        }
    },
    components: {
        CenteredTip
    }
};
</script>

<style lang="less">
.djradio-loading {
    height: 30px;
    display: flex;
    align-items: center;
    .mu-circular-progress {
        margin: 0 15px;
    }
}
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

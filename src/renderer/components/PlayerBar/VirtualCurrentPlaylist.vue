<template>
    <div class="current-list current-list--virtual">
        <CenteredTip v-if="queueEmpty"
            tip="列表里什么都没有，快去找几首歌吧 φ(≧ω≦*)♪"
            icon="music_note"></CenteredTip>
        <template v-else>
            <div class="actions">
                <span class="count">{{titleText}}</span>
                <div class="input"
                    v-show="showFindInput">
                    <mu-text-field ref="findInput"
                        v-model="findInput"
                        action-icon="close"
                        :action-click="toggleFindInput"></mu-text-field>
                </div>
                <div class="buttons"
                    v-show="!showFindInput">
                    <mu-button flat
                        small
                        @click="toggleFindInput">
                        <mu-icon left
                            value="find_in_page"></mu-icon>
                        <span>查找</span>
                    </mu-button>
                    <mu-button flat
                        small
                        @click="handleCollectAll">
                        <mu-icon left
                            value="library_add"></mu-icon>
                        <span>收藏</span>
                    </mu-button>
                    <mu-button flat
                        small
                        @click="handleClearPlaylist">
                        <mu-icon left
                            value="delete_sweep"></mu-icon>
                        <span>清空</span>
                    </mu-button>
                </div>
            </div>
            <RecycleScroller class="mu-list mu-list-dense"
                ref="scroller"
                :items="listToShow"
                :item-size="36"
                keyField="id"
                :buffer="180">
                <template v-slot="{item, index}">
                    <mu-ripple tag="a"
                        :id="`cur-list-${index}`"
                        class="mu-item-wrapper"
                        @click="handleListClick(index)">
                        <div class="mu-item">
                            <div class="mu-item-action">
                                <mu-icon v-if="item.id == playing.id"
                                    color="secondary"
                                    value="volume_up"
                                    :size="18"></mu-icon>
                                <span v-else>{{(indexMap.get(index) || index) + 1}}</span>
                            </div>
                            <div class="mu-item-title">
                                {{item.name}}
                                <span class="track-artist mu-item-after-text"> - {{item.artistName}}</span>
                            </div>
                            <div class="mu-item-action current-list-after">
                                <mu-icon v-if="item.source"
                                    value="link"
                                    :size="22"
                                    :title="sourceTipText(item)"
                                    @click.stop="handleSourceClick(item.source)"></mu-icon>
                                <mu-icon value="close"
                                    :size="22"
                                    title="从列表中删除"
                                    @click.stop="handleRemove(index)"></mu-icon>
                            </div>
                        </div>
                    </mu-ripple>
                </template>
            </RecycleScroller>
        </template>
    </div>
</template>

<script>
import { workerExecute } from '@/worker/message';

import CurrentPlaylist from './CurrentPlaylist.vue';

export default {
    extends: CurrentPlaylist,
    data() {
        return {
            filteredList: [],
            showFindInput: false,
            findInput: '',
            indexMap: new Map()
        };
    },
    computed: {
        listToShow() {
            if (this.showFindInput === true && this.findInput.length > 0) {
                return this.filteredList;
            }
            return this.queue.list;
        },
        titleText() {
            if (this.ui.radioMode) return '私人 FM';
            if (this.showFindInput && this.findInput) return `找到 ${this.filteredList.length} 首`;
            return `共 ${this.queue.list.length} 首`;
        }
    },
    methods: {
        toggleFindInput() {
            this.showFindInput = !this.showFindInput;
            if (this.showFindInput === true) {
                const input = this.$refs.findInput.$el.getElementsByTagName('input')[0];
                if (input) {
                    this.$nextTick(() => input.focus());
                }
            } else {
                this.findInput = '';
            }
        },
        handleListClick(index) {
            let i = index;
            if (this.indexMap.size > 0) {
                i = this.indexMap.get(index);
            }
            CurrentPlaylist.methods.handleListClick.call(this, i);
        },
        handleCollectAll() {
            const ids = this.listToShow.map(t => t.id);
            this.toggleCollectPopup(ids);
        },
        scrollTo(index) {
            const top = this.$refs.scroller.$el.scrollTop;
            const offset = index * 36;
            if (top > offset || top + 324 < offset) {
                this.$refs.scroller.$el.scrollTo(0, offset - 144);
            }
        }
    },
    watch: {
        findInput(val) {
            if (val.length > 0) {
                workerExecute('filterTracks', [val, this.queue.list]).then(res => {
                    this.filteredList = res.result;
                    this.indexMap = res.indexMap;
                });
            } else {
                this.list = this.queue.list;
                this.indexMap.clear();
            }
        }
    },
    created() {
        this.list = this.queue.list;
    }
};
</script>

<style lang="less">
.current-list--virtual {
    .actions {
        .mu-input {
            font-size: 14px;
            margin: 0;
            padding: 0;
            min-height: unset;
            margin-right: 8px;
            .mu-text-field-input {
                height: unset;
            }
            .mu-input-action-icon {
                padding-right: 0;
            }
        }
    }
    .vue-recycle-scroller__item-view.hover {
        background-color: rgba(0, 0, 0, 0.1);
        .current-list-after {
            opacity: 0.6;
        }
    }
}
</style>

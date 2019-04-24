<template>
    <div class="current-list current-list--virtual">
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
            <RecycleScroller class="mu-list mu-list-dense"
                ref="scroller"
                :items="queue.list"
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
                                <span v-else>{{index + 1}}</span>
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
import CurrentPlaylist from './CurrentPlaylist.vue';

export default {
    extends: CurrentPlaylist,
    methods: {
        scrollTo(index) {
            const top = this.$refs.scroller.$el.scrollTop;
            const offset = index * 36;
            if (top > offset || top + 324 < offset) {
                this.$refs.scroller.$el.scrollTo(0, offset - 144);
            }
        }
    }
};
</script>

<style lang="less">
.current-list--virtual {
    .vue-recycle-scroller__item-view.hover {
        background-color: rgba(0, 0, 0, 0.1);
        .current-list-after {
            opacity: 0.6;
        }
    }
}
</style>

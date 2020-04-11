<template>
    <div class="tracklist tracklist--virtual">
        <div v-if="filterable">
            <TrackListHeaeder :disabled="loading"
                :count="trackCount"
                :tracks="details"
                :source="source">
                <mu-text-field ref="findInput"
                    v-model="findInput"
                    placeholder="查找歌曲 ..."
                    @keydown="handleInputKeyDown"
                    :action-icon="findInput.length > 0 ? 'close' : null"
                    :action-click="handleFindClear"></mu-text-field>
            </TrackListHeaeder>
            <mu-divider></mu-divider>
        </div>
        <CenteredLoading v-if="loading"></CenteredLoading>
        <template v-else-if="trackDetails.length !== 0">
            <RecycleScroller page-mode
                :items="tracksToShow"
                :item-size="40"
                key-field="id">
                <template v-slot="{ item, index }">
                    <TrackItem :index="(indexMap.has(index) ? indexMap.get(index) : index) + 1 + indexOffset"
                        :track="item"
                        :shortcuts="shortcuts"
                        @dblclick="handlePlayMapped(index)"
                        @collect="handleCollect(item.id)"
                        @queue="handleQueueMapped(index)"></TrackItem>
                </template>
            </RecycleScroller>
        </template>
        <CenteredTip v-else
            icon="inbox"
            tip="没有歌曲  (ÒωÓױ)"></CenteredTip>
    </div>
</template>

<script>
import { getSongDetail } from '@/api/typed';
import { workerExecute } from '@/worker/message';

import TrackList from './TrackList.vue';
import TrackItem from './TrackItem.vue';
import TrackListHeaeder from './TrackListHeader.vue';
import CenteredTip from '@/components/CenteredTip.vue';
import CenteredLoading from '@/components/CenteredLoading.vue';

export default {
    extends: TrackList,
    props: {
        title: {
            type: String,
            required: false
        },
        tracks: {
            type: Array,
            required: false
        },
        trackIds: {
            type: Array,
            required: false
        },
        filterable: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            loading: false,
            details: [],
            findInput: '',
            filteredList: [],
            indexMap: new Map()
        };
    },
    computed: {
        trackDetails() {
            return this.details;
        },
        tracksToShow() {
            if (this.findInput.length > 0) return this.filteredList;
            return this.details;
        },
        trackCount() {
            if (Array.isArray(this.trackIds)) {
                return this.trackIds.length;
            }
            return this.details.length;
        }
    },
    methods: {
        async updateTrackDetails() {
            this.loading = true;
            const ids = this.trackIds.map(i => i.id);
            this.details = await getSongDetail(ids);
            this.loading = false;
        },
        handlePlayMapped(index) {
            return this.handlePlay(this.indexMap.has(index) ? this.indexMap.get(index) : index);
        },
        handleQueueMapped(index) {
            return this.handleQueue(this.indexMap.has(index) ? this.indexMap.get(index) : index);
        },
        /** @param {KeyboardEvent} e */
        handleInputKeyDown(e) {
            if (e.key === 'Escape') {
                this.findInput = '';
                this.$refs.findInput.blur();
            }
        },
        handleFindClear() {
            this.findInput = '';
            this.$refs.findInput.focus();
        }
    },
    created() {
        if (this.tracks) {
            this.details = this.tracks;
        } else {
            this.updateTrackDetails();
        }
    },
    watch: {
        tracks(val) {
            if (val) {
                this.details = val;
            }
            this.handleFind();
        },
        trackIds(val) {
            if (val) {
                this.updateTrackDetails();
            }
            this.handleFind();
        },
        findInput(val) {
            if (val.length > 0) {
                workerExecute('filterTracks', val, this.details).then(res => {
                    this.filteredList = res.result;
                    this.indexMap = res.indexMap;
                });
            } else {
                this.filteredList = [];
                this.indexMap.clear();
            }
        }
    },
    components: {
        TrackItem,
        TrackListHeaeder,
        CenteredTip,
        CenteredLoading
    }
};
</script>

<style lang="less">
.tracklist__header {
    .mu-input {
        margin: 0 0 0 auto;
        padding: 0;
        font-size: 14px;
        min-height: unset;
        line-height: 30px;
        .mu-text-field-input {
            height: unset;
        }
        .mu-input-action-icon {
            padding: 0 2px;
            font-size: 20px;
        }
    }
}
</style>

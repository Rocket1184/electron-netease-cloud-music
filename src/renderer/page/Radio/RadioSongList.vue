<template>
    <div class="tracklist tracklist--virtual">
        <template v-if="tracks.length !== 0">
            <RecycleScroller page-mode
                :items="tracksToShow"
                :item-size="40"
                key-field="id">
                <template v-slot="{ item, index }">
                    <TrackItem :track="item"
                        :shortcuts="shortcuts"
                        @dblclick="handlePlay(tracks.length - index - 1)"
                        @collect="handleCollect(tracks.id)"
                        @queue="handleQueue(tracks.length - index - 1)"></TrackItem>
                </template>
            </RecycleScroller>
        </template>
        <CenteredTip v-else
            icon="inbox"
            tip="没有歌曲  (ÒωÓױ)"></CenteredTip>
    </div>
</template>

<script>
import TrackItem from '@/components/TrackList/TrackItem.vue';
import TrackList from '@/components/TrackList/VirtualTrackList.vue';
import CenteredTip from '@/components/CenteredTip.vue';

export default {
    extends: TrackList,
    computed: {
        tracksToShow() {
            return this.tracks.slice().reverse();
        }
    },
    methods: {
        handlePlay(index) {
            if (this.ui.radioMode) {
                this.playTrackIndex(index);
            } else {
                this.playTrack(index);
            }
        },
    },
    components: {
        TrackItem,
        CenteredTip
    }
};
</script>

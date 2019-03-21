<template>
    <div class="tracklist">
        <template v-if="tracks.length !== 0">
            <div class="list">
                <TrackItem v-for="n in tracks.length"
                    :key="tracks[tracks.length - n].id"
                    :track="tracks[tracks.length - n]"
                    :shortcuts="shortcuts"
                    @dblclick="handlePlay(tracks.length - n)"
                    @collect="handleCollect(tracks[tracks.length - n].id)"
                    @queue="handleQueue(tracks.length - n)"></TrackItem>
            </div>
        </template>
        <CenteredTip v-else
            icon="inbox"
            tip="没有歌曲  (ÒωÓױ)"></CenteredTip>
    </div>
</template>

<script>
import TrackItem from '@/components/TrackList/TrackItem.vue';
import TrackList from '@/components/TrackList/TrackList.vue';
import CenteredTip from '@/components/CenteredTip.vue';

export default {
    extends: TrackList,
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
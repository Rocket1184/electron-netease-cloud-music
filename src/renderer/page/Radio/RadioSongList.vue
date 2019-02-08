<template>
    <div class="tracklist">
        <template v-if="tracks.length !== 0">
            <div class="list">
                <TrackItem v-for="(track, index) in tracks"
                    :key="track.id"
                    :index="1 + index + indexOffset"
                    :track="track"
                    :shortcuts="shortcuts"
                    @dblclick="handlePlay(index)"
                    @collect="handleCollect(track.id)"
                    @queue="handleQueue(index)"></TrackItem>
            </div>
        </template>
        <CenteredTip v-else
            icon="inbox"
            tip="没有歌曲  (ÒωÓױ)"></CenteredTip>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

import TrackItem from '@/components/TrackList/TrackItem.vue';
import TrackList from '@/components/TrackList/TrackList.vue';
import CenteredTip from '@/components/CenteredTip.vue';

export default {
    extends: TrackList,
    methods: {
        ...mapActions(['dislikeRadioSong']),
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
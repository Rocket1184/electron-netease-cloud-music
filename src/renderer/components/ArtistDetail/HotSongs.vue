<template>
    <div class="hot-songs resource">
        <PlayTracks :source="trackSource"
            :tracks="artist.hotSongs"></PlayTracks>
        <TrackList :source="trackSource"
            :tracks="artist.hotSongs"></TrackList>
    </div>
</template>

<script>
import TrackList from '@/components/TrackList/TrackList.vue';
import PlayTracks from '@/components/PlayTracks.vue';

export default {
    props: {
        artist: {
            required: true
        }
    },
    computed: {
        trackSource() {
            return {
                name: 'artist',
                id: this.artist.detail.id
            };
        }
    },
    components: {
        TrackList,
        PlayTracks
    }
};
</script>


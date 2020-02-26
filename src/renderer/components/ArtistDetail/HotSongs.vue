<template>
    <div class="hot-songs resource">
        <TrackListHeader :source="trackSource"
            :tracks="artist.hotSongs"></TrackListHeader>
        <mu-divider></mu-divider>
        <TrackList :source="trackSource"
            :tracks="artist.hotSongs"></TrackList>
    </div>
</template>

<script>
import TrackList from '@/components/TrackList/TrackList.vue';
import TrackListHeader from '@/components/TrackList/TrackListHeader.vue';

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
        TrackListHeader
    }
};
</script>


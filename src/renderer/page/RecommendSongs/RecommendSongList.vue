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
                    @queue="handleQueue(index)"
                    @dislike="handleDislike(track.id)"></TrackItem>
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

/** @type {import('@/components/TrackList/TrackList.vue').TrackListShortcut} */
const shortcuts = [
    {
        event: 'collect',
        icon: 'bookmark_border',
        title: '收藏到歌单'
    },
    {
        event: 'queue',
        icon: 'playlist_add',
        title: '下一首播放'
    },
    {
        event: 'dislike',
        icon: 'close',
        title: '不感兴趣'
    }
];

export default {
    extends: TrackList,
    computed: {
        shortcuts() {
            return shortcuts;
        }
    },
    methods: {
        handleDislike(id) {
            this.$emit('dislike', id);
        }
    },
    components: {
        TrackItem,
        CenteredTip
    }
};
</script>

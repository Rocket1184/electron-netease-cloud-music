<template>
    <ListDetailLayout class="ncm-page"
        showBack
        :detailLoading="detailLoading">
        <template #list>
            <div v-if="user.loginValid"
                class="disk__aside">
                <p>歌曲永久保存，随时随地多端畅听</p>
                <p>{{ humanSize(size) }} / {{ humanSize(maxSize) }}</p>
                <mu-linear-progress mode="determinate"
                    :value="size / maxSize"
                    color="secondary"></mu-linear-progress>
            </div>
        </template>
        <template v-if="user.loginValid">
            <PlayTracks :tracks="tracks"
                :source="TrackSource"></PlayTracks>
            <VirtualTrackList :tracks="tracks"
                :source="TrackSource"></VirtualTrackList>
        </template>
        <CenteredTip v-else
            icon="cloud_off"
            tip="登录后查看音乐云盘"></CenteredTip>
    </ListDetailLayout>
</template>

<script>
import { mapState } from 'vuex';

import Api from '@/api/ipc';
import { Track } from '@/util/models';
import { humanSize } from '@/util/formatter';

import ListDetailLayout from '@/components/ListDetailLayout.vue';
import PlayTracks from '@/components/PlayTracks.vue';
import VirtualTrackList from '@/components/TrackList/VirtualTrackList.vue';
import CenteredTip from '@/components/CenteredTip.vue';

const TrackSource = {
    name: 'disk'
};

export default {
    data() {
        return {
            size: 0,
            maxSize: 0,
            count: 0,
            tracks: [],
            detailLoading: true
        };
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        humanSize,
        async loadTracks() {
            const res = await Api.getPrivateCloudList(500, 0);
            if (res.code === 200) {
                this.tracks = res.data.map(d => {
                    const a = {
                        al: { id: 0, name: d.album, pic: -1 },
                        ar: [{ id: 0, name: d.artist }]
                    };
                    return new Track(d.simpleSong, a);
                });
                this.size = res.size;
                this.maxSize = res.maxSize;
                this.count = res.count;
            }
            this.detailLoading = false;
        }
    },
    created() {
        this.TrackSource = TrackSource;
    },
    mounted() {
        this.loadTracks();
    },
    components: {
        PlayTracks,
        ListDetailLayout,
        VirtualTrackList,
        CenteredTip
    }
};
</script>

<style lang="less">
.disk__aside {
    padding: 10px 16px;
}
</style>

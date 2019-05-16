<template>
    <div class="tracklist tracklist--virtual">
        <CenteredLoading v-if="loading"></CenteredLoading>
        <template v-else-if="trackDetails.length !== 0">
            <RecycleScroller class="list"
                page-mode
                :items="trackDetails"
                :item-size="40"
                key-field="id">
                <template v-slot="{item, index}">
                    <TrackItem :index="1 + index + indexOffset"
                        :track="item"
                        :shortcuts="shortcuts"
                        @dblclick="handlePlay(index)"
                        @collect="handleCollect(item.id)"
                        @queue="handleQueue(index)"></TrackItem>
                </template>
            </RecycleScroller>
        </template>
        <CenteredTip v-else
            icon="inbox"
            tip="没有歌曲  (ÒωÓױ)"></CenteredTip>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

import TrackList from './TrackList.vue';
import TrackItem from './TrackItem.vue';
import CenteredTip from '@/components/CenteredTip.vue';
import CenteredLoading from '@/components/CenteredLoading.vue';

export default {
    extends: TrackList,
    props: {
        tracks: {
            type: Array,
            required: false
        },
        trackIds: {
            type: Array,
            required: false
        }
    },
    data() {
        return {
            loading: false,
            trackDetails: []
        };
    },
    methods: {
        ...mapActions([
            'getTrackDetail'
        ]),
        async updateTrackDetails() {
            this.loading = true;
            this.trackDetails = await this.getTrackDetail({ ids: this.trackIds });
            this.loading = false;
        }
    },
    created() {
        if (this.tracks) {
            this.trackDetails = this.tracks;
        } else {
            this.updateTrackDetails();
        }
    },
    watch: {
        tracks(val) {
            if (val) {
                this.trackDetails = val;
            }
        },
        trackIds(val) {
            if (val) {
                this.updateTrackDetails();
            }
        }
    },
    components: {
        TrackItem,
        CenteredTip,
        CenteredLoading
    }
};
</script>

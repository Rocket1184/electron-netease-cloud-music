<template>
    <div class="tracklist tracklist--virtual tracklist--dj">
        <CenteredTip v-if="tracks.length === 0"
            icon="inbox"
            tip="没有歌曲  (ÒωÓױ)"></CenteredTip>
        <template v-else>
            <RecycleScroller class="list"
                page-mode
                :items="tracks"
                :item-size="40"
                key-field="id">
                <template v-slot="{ item, index }">
                    <ncm-mu-dbclick-ripple class="track-row"
                        @dblclick="handlePlay(index)">
                        <div class="track-col index">{{total - index}}</div>
                        <div class="track-col name">{{item.name}}</div>
                        <div class="track-col duration">{{item.duration | shortTime}}</div>
                        <div class="track-col buttons">
                            <mu-button v-for="act in shortcuts"
                                :key="act.event"
                                icon
                                small
                                :title="act.title"
                                @click="handleAction(act)">
                                <mu-icon :value="act.icon"></mu-icon>
                            </mu-button>
                        </div>
                    </ncm-mu-dbclick-ripple>
                </template>
            </RecycleScroller>
        </template>
    </div>
</template>

<script>
import { shortTime } from '@/util/formatter';

import TrackList from '@/components/TrackList/TrackList.vue';

const shortcuts = [
    {
        event: 'queue',
        icon: 'playlist_add',
        title: '添加到播放列表'
    }
];

export default {
    extends: TrackList,
    props: {
        loading: {
            type: Boolean,
            required: false
        },
        total: {
            type: Number,
            required: true
        }
    },
    computed: {
        shortcuts() {
            return shortcuts;
        },
        trackDetails() {
            return this.tracks;
        }
    },
    methods: {
        handleAction(act) {
            switch (act.event) {
                case 'queue':
                    break;
            }
        }
    },
    filters: {
        shortTime
    }
};
</script>

<template>
    <div class="tracklist">
        <template v-if="tracks.length !== 0">
            <div class="list">
                <div class="row"
                    v-for="(track, index) in tracks"
                    :key="index">
                    <div class="col index">{{index + 1 + indexOffset}}</div>
                    <div class="col name">{{track.name}}</div>
                    <div class="col artist">{{track.artistName}}</div>
                    <div class="col duration">{{track.duration / 1000 | shortTime}}</div>
                    <div class="col buttons">
                        <mu-icon-button icon="add"
                            title="收藏到歌单"></mu-icon-button>
                        <mu-icon-button icon="playlist_add"
                            title="添加到播放列表"></mu-icon-button>
                    </div>
                </div>
            </div>
        </template>
        <div v-else
            class="loading-wrapper">
            <mu-circular-progress :size="60"
                :strokeWidth="5"></mu-circular-progress>
        </div>
    </div>
</template>

<script>
import { shortTime } from '@/util/formatter';

export default {
    props: {
        tracks: {
            type: Array,
            required: true
        },
        indexOffset: {
            type: Number,
            default: 0,
            required: false
        }
    },
    filters: {
        shortTime
    }
};
</script>

<style lang="less">
.tracklist {
    width: 100%;
    .list {
        .row {
            display: flex;
            flex-direction: row;
            .col {
                height: 48px;
                line-height: 48px;
            }
            .index {
                flex: 1;
                max-width: 48px;
                text-align: center;
            }
            .name,
            .artist {
                flex: 6;
                flex-grow: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding: 0 8px;
            }
            .duration {
                flex: 2;
                flex-grow: 0.2;
            }
            .buttons {
                i {
                    color: grey;
                }
            }
        }
    }
    .loading-wrapper {
        height: 400px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
}
</style>

<template>
    <div class="tracklist">
        <template v-if="list.length !== 0">
            <mu-list-item title="播放全部"
                class="play-all"
                @click="handlePlayAll">
                <mu-icon slot="left"
                    value="play_circle_filled"></mu-icon>
            </mu-list-item>
            <mu-divider></mu-divider>
            <div class="list">
                <div class="row"
                    v-for="(track, index) in listToShow"
                    :key="index">
                    <div class="col index">{{listOffset + index + 1}}</div>
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
            <div class="pagination"
                v-if="list.length > 50">
                <mu-pagination :total="list.length"
                    :current="currentPage"
                    :pageSize="pageSize"
                    @pageChange="handlePageChange">
                </mu-pagination>
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
import { mapActions } from 'vuex';
import { shortTime } from 'util/formatter';

export default {
    props: ['list'],
    data() {
        return {
            currentPage: 1,
            pageSize: 50
        };
    },
    computed: {
        listOffset() {
            return (this.currentPage - 1) * this.pageSize;
        },
        listToShow() {
            return this.list.slice(this.listOffset, this.listOffset + this.pageSize);
        },
    },
    methods: {
        ...mapActions([
            'playPlaylist'
        ]),
        handlePlayAll() {
            this.playPlaylist({ list: this.list });
        },
        handlePageChange(newIndex) {
            this.currentPage = newIndex;
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
    .play-all {
        .mu-icon {
            font-size: 20px;
        }
        .mu-item {
            .mu-item-title {
                padding-left: 8px;
                font-size: 14px;
            }
        }
    }
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
    .do-not-exist {
        .index {
            &:hover {
                font-size: 0;
                &:before {
                    padding-right: 0;
                    content: 'play_circle_filled';
                    font-family: 'Material Icons';
                    font-size: 20px;
                    color: grey;
                }
            }
        }
    }
    .pagination {
        width: 100%;
        padding: 16px;
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

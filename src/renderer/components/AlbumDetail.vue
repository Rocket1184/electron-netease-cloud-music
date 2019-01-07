<template>
    <div class="album-detail">
        <div class="header">
            <img :src="coverSrc"
                class="cover">
            <div class="desc">
                <p class="name">{{album.name}}</p>
                <div class="creator">
                    <mu-avatar class="avatar">
                        <img :src="creatorAvatarSrc">
                    </mu-avatar>
                    <span class="creator-name">{{album.artist.name}}</span>
                    <span class="create-time">{{createTime}}</span>
                </div>
                <div class="actions">
                    <mu-button flat>
                        <mu-icon left
                            value="comment"></mu-icon>
                        <span>评论 ({{album.info.commentCount | formatCount}})</span>
                    </mu-button>
                </div>
                <div class="intro">
                    <mu-list toggle-nested>
                        <mu-list-item button
                            nested
                            :open="descOpen"
                            @click="descOpen = !descOpen">
                            <mu-list-item-title>专辑介绍</mu-list-item-title>
                            <mu-list-item-action>
                                <mu-icon class="toggle-icon"
                                    size="24"
                                    value="keyboard_arrow_down"></mu-icon>
                            </mu-list-item-action>
                            <mu-list-item-content slot="nested">
                                <div class="description">{{albumDesc}}</div>
                            </mu-list-item-content>
                        </mu-list-item>
                    </mu-list>
                </div>
            </div>
        </div>
        <div class="tracks">
            <PlayAll :tracks="album.songs"></PlayAll>
            <div v-for="(tracks, name) in tracksToShow"
                :key="name">
                <mu-sub-header>Disk {{name}}</mu-sub-header>
                <TrackList :tracks="tracks"></TrackList>
            </div>
        </div>
    </div>
</template>

<script>
import PlayAll from '@/components/playAll.vue';
import TrackList from '@/components/trackList.vue';
import { sizeImg, HiDpiPx } from '@/util/image';
import { shortDate } from '@/util/formatter';

export default {
    props: {
        album: {
            required: true
        }
    },
    data() {
        return {
            descOpen: false
        };
    },
    computed: {
        creatorAvatarSrc() {
            return sizeImg(this.album.artist.picUrl, HiDpiPx(40));
        },
        coverSrc() {
            return sizeImg(this.album.picUrl, HiDpiPx(160));
        },
        createTime() {
            return shortDate(this.album.publishTime);
        },
        albumDesc() {
            return `类型：${this.album.subType}\n\n${this.album.description || '暂无介绍'}`;
        },
        tracksToShow() {
            if (!this.album || !this.album.songs) return {};
            let cd = {};
            for (const t of this.album.songs) {
                if (cd[t.cd]) {
                    cd[t.cd].push(t);
                } else {
                    cd[t.cd] = [t];
                }
            }
            return cd;
        }
    },
    filters: {
        formatCount(cnt) {
            return typeof cnt === 'number' ? cnt : '...';
        }
    },
    components: {
        PlayAll,
        TrackList
    }
};
</script>

<style lang="less">
.album-detail {
    .header {
        display: flex;
        padding: 16px;
        .cover {
            height: 160px;
            width: 160px;
            min-width: 160px;
            margin-right: 10px;
        }
        .desc {
            flex-grow: 1;
            .name {
                font-size: 20px;
                margin: 0 0 8px 12px;
            }
            .creator {
                margin: 8px 12px;
                display: flex;
                align-items: center;
                .creator-name {
                    margin: 0 10px;
                }
                .create-time {
                    color: grey;
                }
            }
            .actions {
                display: flex;
            }
            .intro {
                .mu-list {
                    padding: 0;
                }
                .description {
                    margin: 8px;
                    white-space: pre-wrap;
                }
            }
        }
    }
    .tracks {
        .pagination {
            width: 100%;
            padding: 16px;
        }
    }
}
</style>

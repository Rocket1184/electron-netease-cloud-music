<template>
    <div class="album-detail">
        <div class="header">
            <img :src="coverSrc"
                class="cover">
            <div class="side">
                <div class="info">
                    <div class="name">{{album.name}}</div>
                    <div class="creation-info">
                        <router-link tag="div"
                            class="creator"
                            :to="{ name: 'artist', params: { id: album.artist.id } }">
                            <mu-avatar class="avatar">
                                <img :src="creatorAvatarSrc">
                            </mu-avatar>
                            <span class="creator-name">{{album.artist.name}}</span>
                        </router-link>
                        <span class="create-time mu-item-after-text">发布于 {{createTime}}</span>
                    </div>
                </div>
                <div class="actions">
                    <mu-button flat
                        @click="handleSubscribe">
                        <mu-icon left
                            :color="dynamicDetail.isSub ? 'amber' : ''"
                            :value="dynamicDetail.isSub ? 'star' : 'star_border'"></mu-icon>
                        <span>{{btnSubscribeText}}</span>
                    </mu-button>
                    <mu-button flat
                        :to="{ name: 'comment', params: { type: 'album', id: album.id } }">
                        <mu-icon left
                            value="comment"></mu-icon>
                        <span>{{btnCommentText}}</span>
                    </mu-button>
                </div>
                <div class="intro">
                    <mu-list dense
                        toggle-nested>
                        <mu-list-item button
                            nested
                            :open="introOpen"
                            @click="introOpen = !introOpen">
                            <mu-list-item-title>专辑介绍</mu-list-item-title>
                            <mu-list-item-action>
                                <mu-icon class="toggle-icon"
                                    value="keyboard_arrow_down"></mu-icon>
                            </mu-list-item-action>
                            <mu-list-item-content slot="nested">
                                <p class="description">{{albumDesc}}</p>
                            </mu-list-item-content>
                        </mu-list-item>
                    </mu-list>
                </div>
            </div>
        </div>
        <div class="tracks">
            <PlayTracks :source="trackSource"
                :tracks="album.songs"></PlayTracks>
            <div v-for="(tracks, name) in tracksToShow"
                :key="name">
                <mu-sub-header>Disk {{name}}</mu-sub-header>
                <TrackList :source="trackSource"
                    :tracks="tracks"></TrackList>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Api from '@/util/api';
import TrackList from './TrackList.vue';
import PlayTracks from './PlayTracks.vue';
import { shortDate } from '@/util/formatter';
import { sizeImg, HiDpiPx } from '@/util/image';

export default {
    props: {
        album: {
            required: true
        }
    },
    data() {
        return {
            introOpen: false,
            dynamicDetail: {}
        };
    },
    computed: {
        ...mapState(['user']),
        creatorAvatarSrc() {
            return sizeImg(this.album.artist.picUrl, HiDpiPx(40));
        },
        coverSrc() {
            return sizeImg(this.album.picUrl, HiDpiPx(160));
        },
        createTime() {
            return shortDate(this.album.publishTime);
        },
        btnSubscribeText() {
            const t = this.dynamicDetail.isSub ? '已收藏' : '收藏';
            let n = '...';
            if (typeof this.dynamicDetail.subCount === 'number') {
                n = this.dynamicDetail.subCount;
            }
            return `${t} (${n})`;
        },
        btnCommentText() {
            let n = '...';
            if (typeof this.dynamicDetail.commentCount === 'number') {
                n = this.dynamicDetail.commentCount;
            }
            return `评论 (${n})`;
        },
        albumDesc() {
            const d = this.album.description || '暂无专辑介绍';
            return `类型：${this.album.subType}\n\n${d}`;
        },
        trackSource() {
            return {
                name: 'album',
                id: this.album.id
            };
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
    methods: {
        ...mapActions([
            'subscribeAlbum',
            'unsubscribeAlbum'
        ]),
        async updateDynamicDetail() {
            const res = await Api.getAlbumDynamicDetail(this.album.id);
            this.dynamicDetail = res;
        },
        async handleSubscribe() {
            if (!this.user.loginValid) {
                this.$toast.message('汝还没有登录呀      (눈‸눈)');
                return;
            }
            if (this.dynamicDetail.isSub) {
                try {
                    await this.unsubscribeAlbum(this.album);
                } catch (e) {
                    this.$toast.message(`取消收藏失败 ●﹏● ： ${e.code}`);
                }
            } else {
                try {
                    await this.subscribeAlbum(this.album);
                } catch (e) {
                    this.$toast.message(`收藏专辑失败 ●﹏● ： ${e.code}`);
                }
            }
            this.updateDynamicDetail();
        }
    },
    created() {
        this.updateDynamicDetail();
    },
    components: {
        PlayTracks,
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
        .side {
            flex-grow: 1;
            .info {
                padding-left: 16px;
                .name {
                    font-size: 20px;
                    line-height: 30px;
                }
                .creation-info {
                    display: flex;
                    align-items: center;
                    .creator {
                        user-select: none;
                        cursor: pointer;
                        margin: 9px 0;
                        display: flex;
                        align-items: center;
                        .creator-name {
                            margin: 0 1em;
                        }
                    }
                    .create-time {
                        font-size: inherit;
                    }
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
}
</style>

<template>
    <div class="artist-detail">
        <div class="header">
            <div class="inner"
                :style="bkgImgStyle">
                <div class="name-wrapper">
                    <span>
                        <span class="shadow">{{artist.detail.name}}</span>
                        <span class="shadow alia"
                            v-for="alia in artist.detail.alias"
                            :key="alia">{{alia}}</span>
                    </span>
                    <mu-button flat
                        class="shadow"
                        color="white"
                        @click="handleFollow">
                        <mu-icon left
                            :value="dynamicDetail.followed ? 'star' : 'star_border'"
                            :color="dynamicDetail.followed ? 'amber' : 'white'"></mu-icon>
                        <span class="shaodw">{{dynamicDetail.followed ? '已收藏' : '收藏'}}</span>
                    </mu-button>
                </div>
            </div>
        </div>
        <mu-tabs inverse
            center
            :value.sync="tab">
            <mu-tab value="hotSongs">热门单曲</mu-tab>
            <mu-tab value="albums">所有专辑</mu-tab>
            <mu-tab value="mvs">相关 MV</mu-tab>
            <mu-tab value="intro">艺人介绍</mu-tab>
        </mu-tabs>
        <template v-if="tab === 'hotSongs'">
            <PlayTracks :tracks="artist.hotSongs"></PlayTracks>
            <TrackList :tracks="artist.hotSongs"></TrackList>
        </template>
        <template v-else-if="tab === 'albums'">
            <AlbumList :list="artist.albums"></AlbumList>
        </template>
        <template v-else-if="tab === 'mvs'">
            <VideoList :videos="artist.mvs"></VideoList>
        </template>
        <section v-else-if="tab === 'intro'"
            class="intro">
            <p class="para">{{artist.intro.briefDesc}}</p>
            <template v-for="i in artist.intro.introduction">
                <mu-sub-header :key="i.ti+'ti'">{{i.ti}}</mu-sub-header>
                <p class="para"
                    :key="i.ti+'tx'">{{i.txt}}</p>
            </template>
        </section>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Api from '@/util/api';
import { bkgImg, sizeImg } from '@/util/image';
import VideoList from '@/components/VideoList.vue';
import AlbumList from '@/components/AlbumList.vue';
import TrackList from '@/components/TrackList.vue';
import PlayTracks from '@/components/PlayTracks.vue';

export default {
    props: {
        artist: {
            required: true
        }
    },
    data() {
        return {
            tab: 'hotSongs',
            dynamicDetail: {}
        };
    },
    computed: {
        ...mapState(['user']),
        bkgImgStyle() {
            return bkgImg(sizeImg(this.artist.detail.picUrl, 640, 300));
        }
    },
    methods: {
        ...mapActions([
            'followArtist',
            'unfollowArtist'
        ]),
        async updateDynamicDetail() {
            const resp = await Api.getArtistDynamicDetail(this.artist.detail.id);
            this.dynamicDetail = resp;
        },
        async handleFollow() {
            if (!this.user.loginValid) {
                this.$toast.message('汝还没有登录呀      (눈‸눈)');
                return;
            }
            if (this.dynamicDetail.followed) {
                try {
                    await this.unfollowArtist(this.artist.detail);
                } catch (e) {
                    this.$toast.message(`取消收藏失败 ●﹏● ： ${e.code}`);
                }
            } else {
                try {
                    await this.followArtist(this.artist.detail);
                } catch (e) {
                    this.$toast.message(`收藏歌手失败 ●﹏● ： ${e.code}`);
                }
            }
            this.updateDynamicDetail();
        }
    },
    async created() {
        this.updateDynamicDetail();
    },
    components: {
        VideoList,
        AlbumList,
        TrackList,
        PlayTracks
    }
};
</script>

<style lang="less">
.artist-detail {
    .header {
        width: 100%;
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        .inner {
            width: 640px;
            height: 300px;
            display: flex;
            flex-direction: column-reverse;
            .name-wrapper {
                padding: 0 16px 8px;
                display: flex;
                justify-content: space-between;
                font-size: 24px;
                color: white;
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
                .shadow {
                    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
                }
                .alia {
                    font-size: 18px;
                    opacity: 0.8;
                    margin-left: 0.5em;
                }
            }
        }
    }
    .mu-tabs {
        background-color: transparent;
    }
    .intro {
        padding: 16px 50px;
        .para {
            white-space: pre-wrap;
            font-size: 14px;
            margin: 0 0.5em;
            line-height: 22px;
        }
    }
}
</style>

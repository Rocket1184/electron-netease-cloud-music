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
            :value="tab"
            @change="handelTabChange">
            <mu-tab v-for="tab in  detailTabs"
                :key="tab[0]"
                :value="tab[0]">{{tab[1]}}</mu-tab>
        </mu-tabs>
        <transition :name="transitionName"
            mode="out-in">
            <keep-alive>
                <component :is="detailCompo"
                    :artist="artist"
                    @scroll="handleScroll"></component>
            </keep-alive>
        </transition>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Api from '@/api/ipc';
import { bkgImg, sizeImg } from '@/util/image';
import HotSongs from './HotSongs.vue';
import AllAlbums from './AllAlbums.vue';
import RelatedMVs from './RelatedMVs.vue';
import Introduction from './Introduction.vue';

const DetailTabs = [
    ['hotSongs', '热门单曲'],
    ['albums', '所有专辑'],
    ['mvs', '相关 MV'],
    ['intro', '艺人介绍']
];

const DetailCompo = {
    hotSongs: HotSongs,
    albums: AllAlbums,
    mvs: RelatedMVs,
    intro: Introduction
};

export default {
    props: {
        artist: {
            required: true
        }
    },
    data() {
        return {
            tab: 'hotSongs',
            dynamicDetail: {},
            detailTabs: DetailTabs,
            transitionName: 'slide-left'
        };
    },
    computed: {
        ...mapState(['user']),
        bkgImgStyle() {
            return bkgImg(sizeImg(this.artist.detail.picUrl, 640, 300));
        },
        detailCompo() {
            return DetailCompo[this.tab];
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
        },
        handelTabChange(val) {
            let oldIndex, newIndex;
            DetailTabs.forEach((tab, index) => {
                if (tab[0] === this.tab) oldIndex = index;
                if (tab[0] === val) newIndex = index;
            });
            if (newIndex < oldIndex) {
                this.transitionName = 'slide-right';
            } else {
                this.transitionName = 'slide-left';
            }
            this.tab = val;
        },
        handleScroll() {
            const el = document.querySelector('.ld-detail');
            if (el) {
                el.scrollTo({ top: 300, behavior: 'smooth' });
            }
        }
    },
    async created() {
        this.updateDynamicDetail();
    },
    components: {
        AllAlbums,
        RelatedMVs,
        Introduction
    }
};
</script>

<style lang="less">
.artist-detail {
    overflow-x: hidden;
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
    .resource {
        min-height: calc(~'100vh - 176px');
        .centered-loading {
            height: 160px;
        }
        .pagination {
            margin: 20px;
        }
    }
    .intro {
        padding: 16px 50px;
        .subhead {
            margin: 12px 0;
            font-size: 16px;
            font-weight: bold;
        }
        .para {
            font-size: 14px;
            margin: 0;
            line-height: 22px;
        }
    }
}
</style>

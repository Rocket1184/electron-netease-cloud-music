<template>
    <div class="artist-detail">
        <div class="header">
            <div class="inner"
                :style="bkgImgStyle">
                <div class="name-wrapper">
                    <span class="left">
                        <span class="shadow name">{{artist.detail.name}}</span>
                        <span class="shadow alia"
                            v-for="alia in artist.detail.alias"
                            :key="alia">{{alia}}</span>
                    </span>
                    <router-link v-if="accountRoute"
                        :to="accountRoute"
                        v-slot="{ navigate }"
                        custom>
                        <mu-button flat
                            small
                            class="shadow account"
                            color="white"
                            @click="navigate">
                            <mu-icon left
                                value="person_outline"></mu-icon>
                            <span class="shaodw">个人主页</span>
                        </mu-button>
                    </router-link>
                    <mu-button flat
                        small
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
            <mu-tab v-for="tab of DetailTabs"
                :key="tab.key"
                :value="tab.key">{{ tab.title }}</mu-tab>
        </mu-tabs>
        <div class="slide-anim-container">
            <transition :name="transitionName">
                <keep-alive>
                    <component :is="detailCompo"
                        :artist="artist"
                        @scroll="handleScroll"></component>
                </keep-alive>
            </transition>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

import Api from '@/api/ipc';
import { bkgImg, sizeImg } from '@/util/image';
import HotSongs from './HotSongs.vue';
import AllAlbums from './AllAlbums.vue';
import RelatedMVs from './RelatedMVs.vue';
import Introduction from './Introduction.vue';

const DetailTabs = [
    { key: 'hotSongs', title: '热门单曲' },
    { key: 'albums', title: '所有专辑' },
    { key: 'mvs', title: '相关 MV' },
    { key: 'intro', title: '艺人介绍' }
];

const DetailCompo = {
    hotSongs: 'HotSongs',
    albums: 'AllAlbums',
    mvs: 'RelatedMVs',
    intro: 'Introduction'
};

/** @typedef {{ detail: Models.Artist, hotSongs: Models.Track[] }} ArtistDetails */

export default {
    props: {
        /** @type {Vue.PropOptions<ArtistDetails>} */
        artist: {
            required: true
        }
    },
    data() {
        return {
            tab: 'hotSongs',
            dynamicDetail: {},
            transitionName: 'slide-left'
        };
    },
    computed: {
        /** @returns {{ key: string, title: string }[]} */
        DetailTabs() { return DetailTabs; },
        /** @returns {import('@/store/modules/user').State} */
        user() { return this.$store.state.user; },
        /** @returns {string} */
        bkgImgStyle() {
            return bkgImg(sizeImg(this.artist.detail.picUrl, 640, 300));
        },
        /** @returns {import('vue-router').Route} */
        accountRoute() {
            const id = this.artist.detail.accountId;
            return id ? { name: 'user', params: { id } } : null;
        },
        /** @returns {string} */
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
                if (tab.key === this.tab) oldIndex = index;
                if (tab.key === val) newIndex = index;
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
    created() {
        this.updateDynamicDetail();
    },
    components: {
        HotSongs,
        AllAlbums,
        RelatedMVs,
        Introduction
    }
};
</script>

<style lang="less">
.artist-detail {
    height: 100%;
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
                justify-content: flex-start;
                align-items: flex-end;
                color: white;
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
                .shadow {
                    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
                }
                .left {
                    margin-right: auto;
                    .name {
                        font-size: 24px;
                    }
                    .alia {
                        font-size: 18px;
                        opacity: 0.8;
                        margin-left: 0.5em;
                    }
                }
                .account {
                    margin-right: 8px;
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

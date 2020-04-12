<template>
    <div class="user-detail">
        <div class="user-bkg"
            :style="bkgImgStyle">
            <div class="user-bkg-cover"></div>
            <div class="avatar-wrapper">
                <img class="user-avatar"
                    :src="avatarUrl">
                <TypeBadge v-if="user.profile.userType"
                    :type="user.profile.userType"></TypeBadge>
            </div>
            <div class="user-name">{{ user.profile.nickname }}
                <GenderIcon v-if="user.profile.gender"
                    :gender="user.profile.gender"></GenderIcon>
            </div>
            <div v-if="description"
                class="user-desc">{{ description }}</div>
            <div class="user-follows">{{ follows }}</div>
            <div class="user-buttons">
                <mu-button v-if="isSelf"
                    flat
                    small
                    color="white"
                    :to="{ path: '/editprofile' }">
                    <mu-icon left
                        value="edit"></mu-icon>
                    编辑资料
                </mu-button>
                <mu-button v-else
                    flat
                    small
                    color="white"
                    @click="handleFollow">
                    <mu-icon left
                        :value="followBtn.icon"></mu-icon>
                    {{ followBtn.text }}
                </mu-button>
                <mu-button v-if="user.profile.artistId"
                    flat
                    small
                    color="white"
                    class="user-artist"
                    :to="{ name: 'artist', params: { id: user.profile.artistId } }">
                    查看歌手页
                    <mu-icon right
                        value="chevron_right"></mu-icon>
                </mu-button>
            </div>
        </div>
        <mu-tabs inverse
            center
            :value="tab"
            @change="handleTabChange">
            <mu-tab v-for="tab of Tabs"
                :key="tab[0]"
                :value="tab[0]">{{tab[1]}}</mu-tab>
        </mu-tabs>
        <transition mode="out-in"
            :name="transitionName">
            <keep-alive>
                <component :is="detailCompo"
                    :user="user"
                    :isSelf="isSelf"></component>
            </keep-alive>
        </transition>
    </div>
</template>

<script>
import { mapState } from 'vuex';

import Api from '@/api/ipc';
import { sizeImg, HiDpiPx } from '@/util/image';

import TypeBadge, { UserType, DefaultUserType } from './TypeBadge.vue';
import GenderIcon from './GenderIcon.vue';
import Music from './Music.vue';
import Record from './Record.vue';
import Event from './Event.vue';
import About from './About.vue';

const Tabs = [
    ['music', '音乐'],
    ['record', '排行'],
    ['event', '动态'],
    ['about', '关于']
];

const DetailCompo = {
    music: 'Music',
    record: 'Record',
    event: 'Event',
    about: 'About'
};

export default {
    props: {
        user: {
            required: true
        }
    },
    data() {
        return {
            dynamicFollows: {
                followed: null,
                followeds: null
            },
            tab: 'music',
            transitionName: ''
        };
    },
    computed: {
        ...mapState({
            userState: 'user'
        }),
        isSelf() {
            if (!this.userState.loginValid) return false;
            return this.userState.info.id === this.user.profile.userId;
        },
        bkgImgStyle() {
            return `background-image:url(${sizeImg(this.user.profile.backgroundUrl, HiDpiPx(640), HiDpiPx(300))})`;
        },
        avatarUrl() {
            return sizeImg(this.user.profile.avatarUrl, HiDpiPx(75));
        },
        description() {
            const p = this.user.profile;
            if (!p.userType) return null;
            return p.description || (UserType[p.userType] || DefaultUserType).name;
        },
        follows() {
            const p = this.user.profile;
            const follows = typeof p.follows === 'number' ? p.follows : '...';
            const followeds = typeof this.dynamicFollows.followeds === 'number' ? this.dynamicFollows.followeds : '...';
            return `关注 ${follows} ｜ 粉丝 ${followeds}`;
        },
        followBtn() {
            return this.dynamicFollows.followed
                ? { icon: 'done', text: '已关注' }
                : { icon: 'add', text: '关注' };
        },
        detailCompo() {
            return DetailCompo[this.tab];
        }
    },
    methods: {
        updateDynamicFollows(follow) {
            if (typeof follow === 'boolean') {
                this.dynamicFollows.followed = follow;
                this.dynamicFollows.followeds += follow === true ? 1 : -1;
            } else {
                const p = this.user.profile;
                this.dynamicFollows.followed = p.followed;
                this.dynamicFollows.followeds = p.followeds;
            }
        },
        async handleFollow() {
            if (!this.userState.loginValid) {
                this.$toast.message('汝还没有登录呀      (눈‸눈)');
                return;
            }
            const id = this.user.profile.userId;
            if (this.dynamicFollows.followed) {
                try {
                    await Api.unfollowUser(id);
                    this.updateDynamicFollows(false);
                } catch (e) {
                    this.$toast.message(`取消关注失败 ●﹏● ： ${e.code}`);
                }
            } else {
                try {
                    await Api.followUser(id);
                    this.updateDynamicFollows(true);
                } catch (e) {
                    this.$toast.message(`关注失败 ●﹏● ： ${e.code}`);
                }
            }
        },
        handleTabChange(val) {
            let oldIndex, newIndex;
            Tabs.forEach((tab, index) => {
                if (tab[0] === this.tab) oldIndex = index;
                if (tab[0] === val) newIndex = index;
            });
            if (newIndex < oldIndex) {
                this.transitionName = 'slide-right';
            } else {
                this.transitionName = 'slide-left';
            }
            this.tab = val;
        }
    },
    watch: {
        user() {
            this.updateDynamicFollows();
        }
    },
    created() {
        this.Tabs = Tabs;
        this.updateDynamicFollows();
    },
    components: {
        TypeBadge,
        GenderIcon,
        Music,
        Record,
        Event,
        About
    }
};
</script>

<style lang="less">
.user-detail {
    // a hack to make RecyclerScroller work
    // https://github.com/Akryum/vue-virtual-scroller/blob/v1.0.0-rc.2/src/components/RecycleScroller.vue#L462
    // https://github.com/olahol/scrollparent.js/blob/2.0.1/scrollparent.js#L18-L28
    overflow: hidden overlay;
    .user-bkg {
        position: relative;
        height: 300px;
        width: 640px;
        margin: 0 auto;
        background-size: cover;
        background-position: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
    }
    .user-bkg-cover {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.2);
    }
    .avatar-wrapper {
        position: relative;
        height: 75px;
        width: 75px;
        margin-bottom: 16px;
        .user-avatar {
            height: 75px;
            width: 75px;
            border-radius: 50%;
        }
    }
    .user-name {
        font-size: 18px;
    }
    .user-name,
    .user-desc,
    .user-follows {
        margin: 4px 0;
        z-index: 1;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
    .user-buttons {
        margin-top: 20px;
        display: flex;
    }
    .user-artist {
        margin-left: 16px;
    }
    .mu-tabs {
        background: transparent;
    }
    .user-music,
    .user-record,
    .user-event,
    .user-about {
        min-height: calc(~'100vh - 176px');
        .centered-loading {
            height: 160px;
        }
    }
}
</style>

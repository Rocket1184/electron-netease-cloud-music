<template>
    <div class="appbar"
        :class="appbarDynamicClassName">
        <div id="appbar-window-control">
            <mu-button icon
                small
                color="white"
                @click="handleClose()">
                <mu-icon value="close"
                    :size="16"></mu-icon>
            </mu-button>
            <mu-button icon
                small
                color="white"
                @click="handleMaximize()">
                <mu-icon value="keyboard_arrow_up"
                    :size="16"></mu-icon>
            </mu-button>
            <mu-button icon
                small
                color="white"
                @click="handleMinimize()">
                <mu-icon value="keyboard_arrow_down"
                    :size="16"></mu-icon>
            </mu-button>
        </div>
        <mu-appbar title="Electron Netease Cloud Music"
            color="primary">
            <mu-button icon
                slot="left"
                @click="drawerOpen = true">
                <mu-icon value="menu"></mu-icon>
            </mu-button>
            <searchBox slot="right"></searchBox>
        </mu-appbar>
        <mu-drawer :width="300"
            :docked="false"
            :open.sync="drawerOpen"
            class="appbar-drawer">
            <div class="header"
                :style="backgroundUrlStyle">
                <mu-avatar :size="80">
                    <img v-if="user.loginValid"
                        :src="avatarUrl">
                    <mu-icon v-else
                        value="music_note"
                        :size="40"></mu-icon>
                </mu-avatar>
                <div class="text">
                    <span class="username"
                        @click="handleNameClick()">{{user.info.nickname}}</span>
                    <mu-button flat
                        v-if="user.loginValid"
                        class="button-checkin"
                        color="white"
                        @click="handleCheckIn()">签到</mu-button>
                </div>
            </div>
            <mu-list>
                <mu-list-item v-for="route in validRoutes"
                    button
                    @click="closeDrawer"
                    :key="route.name"
                    :to="route.path">
                    <mu-list-item-action>
                        <mu-icon :value="route.icon"></mu-icon>
                    </mu-list-item-action>
                    <mu-list-item-title>{{route.title}}</mu-list-item-title>
                </mu-list-item>
            </mu-list>
        </mu-drawer>
        <loginDialog :show.sync="loginDlgShow"></loginDialog>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { remote } from 'electron';
import { platform } from 'os';

import { bkgImg, sizeImg, HiDpiPx } from "@/util/image";
import ApiRenderer from '@/util/apiRenderer';
import loginDialog from './loginDialog.vue';
import searchBox from './searchBox.vue';
import Routes from '@/routes';

function checkIn(...args) {
    return ApiRenderer.postDailyTask(...args);
}

export default {
    data() {
        return {
            currentWindow: remote.getCurrentWindow(),
            drawerOpen: false,
            loginDlgShow: false
        };
    },
    computed: {
        ...mapState(['settings', 'user']),
        validRoutes() {
            return Routes.filter(r => r.icon);
        },
        appbarDynamicClassName() {
            return {
                'is-darwin': platform() === 'darwin',
                'is-frameless': this.settings.windowBorder === false
            };
        },
        avatarUrl() {
            return sizeImg(this.user.info.avatarUrl, HiDpiPx(80));
        },
        backgroundUrlStyle() {
            return this.user.info.bkgUrl && bkgImg(sizeImg(this.user.info.bkgUrl, HiDpiPx(300), HiDpiPx(200)));
        }
    },
    methods: {
        ...mapActions(['logout']),
        handleClose() {
            this.currentWindow.close();
        },
        handleMinimize() {
            this.currentWindow.minimize();
        },
        handleMaximize() {
            if (this.currentWindow.isMaximized())
                this.currentWindow.unmaximize();
            else
                this.currentWindow.maximize();
        },
        closeDrawer() {
            this.drawerOpen = false;
        },
        handleNameClick() {
            if (!this.user.loginValid) {
                this.loginDlgShow = true;
            } else {
                this.$confirm(
                    '退出登录后将无法查看每日歌曲推荐，收藏的歌单等信息，确定吗？',
                    '退出登录'
                ).then(({ result }) => {
                    if (result) {
                        this.logout();
                    }
                });
            }
        },
        async handleCheckIn() {
            // write them as array literal, then async functions would be
            // executed serially ( like `async.waterfall` )
            const points = [await checkIn(0), await checkIn(1)]
                .map(r => r.code === 200 ? r.point : 0)
                .reduce((a, b) => a + b);
            if (points) {
                this.$toast.message(`签到成功，获得 ${points} 点积分`);
            } else {
                this.$toast.message('是不是已经签到过了呢 ：）');
            }
        }
    },
    components: {
        loginDialog,
        searchBox
    }
};
</script>

<style lang="less">
.appbar {
    z-index: 1;
    cursor: default;
    user-select: none;
    -webkit-app-region: drag;
    #appbar-window-control {
        // hide window control by default
        display: none;
    }
    .mu-appbar-left,
    .mu-appbar-right {
        -webkit-app-region: no-drag;
    }
    &.is-frameless {
        #appbar-window-control {
            display: block;
        }
        .mu-appbar {
            padding-top: 16px;
        }
    }
    &.is-darwin {
        #appbar-window-control {
            display: none;
        }
        &.is-frameless {
            .mu-appbar {
                padding-top: 12px;
            }
        }
    }
}

#appbar-window-control {
    z-index: 10;
    -webkit-app-region: no-drag;
    position: absolute;
    top: 0;
    left: 0;
    button {
        cursor: default !important;
        width: 28px;
        height: 28px;
    }
}

.appbar-drawer {
    .header {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 14px;
        width: 100%;
        height: 200px;
        background-size: cover;
        background-image: url('~assets/img/bkg.svg');
        background-position-y: 50%;
        -webkit-app-region: no-drag;
        .text {
            margin-top: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .username {
                color: white;
                text-shadow: 0 0 4px black;
                font-size: 20px;
                cursor: pointer;
                line-height: 36px;
                width: 160px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }
}
</style>

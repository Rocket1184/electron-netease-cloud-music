<template>
    <div class="appbar"
        :class="appbarDynamicClassName">
        <div id="appbar-window-control">
            <mu-button icon
                @click="handleClose()">
                <mu-icon value="close"></mu-icon>
            </mu-button>
            <mu-button icon
                @click="handleMaximize()">
                <mu-icon value="keyboard_arrow_up"></mu-icon>
            </mu-button>
            <mu-button icon
                @click="handleMinimize()">
                <mu-icon value="keyboard_arrow_down"></mu-icon>
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
            :open="drawerOpen"
            :docked="false"
            @close="drawerOpen = false">
            <mu-list class="appnav-drawer">
                <div class="header"
                    :style="backgroundUrlStyle">
                    <div class="user-info">
                        <mu-avatar :size="80">
                            <img v-if="loginValid"
                                :src="avatarUrl">
                            <mu-icon v-else
                                value="music_note"
                                :size="40"></mu-icon>
                        </mu-avatar>
                        <span class="user-name"
                            @click="handleNameClick()">{{user.name}}</span>
                        <mu-button flat
                            v-if="loginValid"
                            class="button-checkin"
                            color="white"
                            @click="handleCheckIn()">签到</mu-button>
                    </div>
                </div>
                <mu-list>
                    <template v-for="route in validRoutes">
                        <mu-list-item button
                            :key="route.name"
                            :to="route.path">
                            <mu-list-item-action>
                                <mu-icon :value="route.icon"></mu-icon>
                            </mu-list-item-action>
                            <mu-list-item-title>{{route.title}}</mu-list-item-title>
                        </mu-list-item>
                    </template>
                </mu-list>
            </mu-list>
        </mu-drawer>
        <loginDialog :show="loginDlgShow"
            @close="loginDlgShow = false"></loginDialog>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
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
        ...mapState(['settings']),
        ...mapGetters(['loginValid', 'user']),
        validRoutes() {
            return Routes.filter(r => r.icon);
        },
        appbarDynamicClassName() {
            return {
                'not-updated': this.settings._updated === false,
                'is-darwin': platform() === 'darwin',
                'is-frameless': this.settings.windowBorder === false
            };
        },
        avatarUrl() {
            return sizeImg(this.user.avatarUrl, HiDpiPx(80));
        },
        backgroundUrlStyle() {
            return this.user.bkgUrl && bkgImg(sizeImg(this.user.bkgUrl, HiDpiPx(300), HiDpiPx(200)));
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
        handleNameClick() {
            if (!this.loginValid) {
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
    created() {
        this.$router.afterEach(() => this.drawerOpen = false);
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
    .mu-appbar {
        .left {
            cursor: pointer;
            -webkit-app-region: no-drag;
        }
    }
    &.not-updated {
        .mu-appbar > div {
            display: none;
        }
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
    transform: scale(0.6);
    position: absolute;
    left: -27px;
    top: -9px;
    color: white;
    button {
        cursor: default !important;
        margin-right: -2px;
        .mu-ripple-wrapper {
            border-radius: 100%;
            transition: background-color 0.2s;
        }
        &:hover .mu-ripple-wrapper {
            background-color: rgba(0, 0, 0, 0.1);
        }
    }
}

.appnav-drawer {
    padding-top: 0;
    .header {
        position: relative;
        width: 100%;
        height: 200px;
        background-size: cover;
        background-image: url('~assets/img/bkg.svg');
        background-position-y: 50%;
        &::before {
            position: absolute;
            content: ' ';
            color: transparent;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.2);
        }
        .user-info {
            position: absolute;
            padding: 20px;
            bottom: 0;
            left: 0;
            .mu-avatar {
                display: block;
            }
            .user-name {
                margin-top: 10px;
                color: white;
                font-size: 20px;
                cursor: pointer;
                display: inline-block;
                line-height: 36px;
                width: 160px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                vertical-align: bottom;
            }
            .button-checkin {
                display: inline-block;
            }
        }
    }
}
</style>

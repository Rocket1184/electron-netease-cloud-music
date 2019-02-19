<template>
    <div class="appbar"
        :class="appbarDynamicClassName">
        <template v-if="!settings.windowBorder">
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
            <div id="appbar-drag-region"></div>
        </template>
        <mu-appbar title="Electron Netease Cloud Music"
            color="primary">
            <mu-button icon
                slot="left"
                @click="drawerOpen = true">
                <mu-icon value="menu"></mu-icon>
            </mu-button>
            <SearchBox slot="right"></SearchBox>
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
                        value="person"
                        :size="40"></mu-icon>
                </mu-avatar>
                <div class="text">
                    <span class="username"
                        @click="handleNameClick()">{{username}}</span>
                    <mu-button flat
                        v-if="user.loginValid"
                        class="btn-sign"
                        color="white"
                        :disabled="btnSignDisabled"
                        @click="handleSign()">
                        <mu-icon left
                            :value="btnSignIcon"
                            :size="16"></mu-icon>
                        <span>{{btnSignText}}</span>
                    </mu-button>
                </div>
            </div>
            <mu-list>
                <mu-list-item v-for="route in validRoutes"
                    button
                    @click="closeDrawer"
                    :key="route.name"
                    :to="route.path">
                    <mu-list-item-action>
                        <mu-icon :value="route.icon || 'bug_report'"></mu-icon>
                    </mu-list-item-action>
                    <mu-list-item-title>{{route.title}}{{route.icon ? '' : ' (debug)'}}</mu-list-item-title>
                </mu-list-item>
            </mu-list>
        </mu-drawer>
        <LoginDialog :show.sync="loginDlgShow"></LoginDialog>
    </div>
</template>

<script>
import { platform } from 'os';
import { remote } from 'electron';
import { mapActions, mapState } from 'vuex';

import Routes from '@/routes';
import SearchBox from './SearchBox.vue';
import LoginDialog from './LoginDialog.vue';
import { bkgImg, sizeImg, HiDpiPx } from "@/util/image";
import { UPDATE_SETTINGS, SET_USER_SIGN_STATUS } from '@/vuex/mutation-types';

const SignIcon = {
    0: 'looks_5',
    2: 'looks_3',
    3: 'looks_two',
    5: 'check_circle'
};

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
            return Routes.filter(r => r.title);
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
        username() {
            if (this.user.loginPending) return '登录中 ...';
            if (this.user.loginValid) return this.user.info.nickname;
            return '点击登录';
        },
        backgroundUrlStyle() {
            return this.user.info.bkgUrl && bkgImg(sizeImg(this.user.info.bkgUrl, HiDpiPx(300), HiDpiPx(200)));
        },
        signLevel() {
            let res = 0;
            if (this.user.signStatus.pcSign) res += 2;
            if (this.user.signStatus.mobileSign) res += 3;
            return res;
        },
        btnSignDisabled() {
            return this.user.signPending || this.signLevel === 5;
        },
        btnSignText() {
            if (this.signLevel === 5) return '已签到';
            return '未签到';
        },
        btnSignIcon() {
            return SignIcon[this.signLevel];
        }
    },
    methods: {
        ...mapActions([
            'logout',
            'checkin'
        ]),
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
        async handleSign() {
            const points = await this.checkin();
            if (points > 0) {
                this.$toast.message(`签到成功，获得 ${points} 点积分`);
            } else {
                this.$toast.message('是不是已经签到过了呢 ：）');
            }
        }
    },
    created() {
        this.$store.subscribe((mutation, state) => {
            // settings.autoSign enabled
            if ((mutation.type === UPDATE_SETTINGS && mutation.payload.autoSign === true) ||
                // signStatus updated via `actions.updateUserSignStatus`
                (mutation.type === SET_USER_SIGN_STATUS && typeof mutation.payload.timestamp === 'number')) {
                const { timestamp, pcSign, mobileSign } = state.user.signStatus;
                // signStatus was not up-to-date || signed already
                if (timestamp < 0 || pcSign && mobileSign) return;
                this.handleSign();
            }
        });
    },
    components: {
        LoginDialog,
        SearchBox
    }
};
</script>

<style lang="less">
.appbar {
    &.is-frameless {
        .mu-appbar {
            padding-top: 16px;
        }
    }
    &.is-darwin {
        &.is-frameless {
            .mu-appbar {
                padding-top: 12px;
            }
        }
    }
    #appbar-window-control {
        z-index: 11;
        position: fixed;
        top: 0;
        left: 0;
        button {
            cursor: default !important;
            width: 28px;
            height: 28px;
        }
    }
    #appbar-drag-region {
        position: fixed;
        left: 84px;
        top: 2px;
        right: 60px;
        height: 62px;
        -webkit-app-region: drag;
    }
    .mu-appbar {
        user-select: none;
        z-index: 10;
        position: fixed;
        width: 100%;
        top: 0;
        left: 0;
        .mu-appbar-title {
            line-height: unset;
        }
    }
}

.appbar-drawer {
    user-select: none;
    .header {
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
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.66));
            .username {
                color: white;
                font-size: 20px;
                cursor: pointer;
                line-height: 36px;
                width: 160px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .btn-sign.disabled {
                color: rgba(255, 255, 255, 0.7);
            }
        }
    }
}
</style>

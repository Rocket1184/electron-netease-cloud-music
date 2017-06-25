<template>
    <div class="appbar"
        :class="appbarDynamicClassName">
        <div id="appbar-window-control"
            v-if="shouldWindowCtlShow">
            <mu-icon-button @click="handleClose()"
                icon="close"></mu-icon-button>
            <mu-icon-button @click="handleMaximize()"
                icon="keyboard_arrow_up"></mu-icon-button>
            <mu-icon-button @click="handleMinimize()"
                icon="keyboard_arrow_down"></mu-icon-button>
        </div>
        <mu-appbar title="Electron Netease Cloud Music">
            <mu-icon-button icon="menu"
                slot="left"
                @click="toggleDrawer()"></mu-icon-button>
            <searchBox slot="right"></searchBox>
        </mu-appbar>
        <mu-drawer :width="300"
            :open="drawerOpen"
            :docked="false"
            @close="toggleDrawer()">
            <mu-list class="appnav-drawer">
                <div class="header"
                    :style="backgroundUrlStyle">
                    <div class="user-info">
                        <mu-avatar :icon="loginValid ? null : 'music_note'"
                            :src="user.avatarUrl"
                            :iconSize="40"
                            :size="80"></mu-avatar>
                        <span class="user-name"
                            @click="handleNameClick()">{{user.name}}</span>
                        <mu-flat-button v-if="loginValid"
                            label="签到"
                            class="button-checkin"
                            color="white"
                            @click="handleCheckIn()"></mu-flat-button>
                    </div>
                </div>
                <router-link v-for="route in validRoutes"
                    :key="route.name"
                    :to="route.path">
                    <mu-list-item :title="route.name">
                        <mu-icon slot="left"
                            :value="route.icon"></mu-icon>
                    </mu-list-item>
                </router-link>
            </mu-list>
        </mu-drawer>
        <loginDialog :show="dlgShow"
            @close="toggleDlg()"></loginDialog>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { remote } from 'electron';

import ApiRenderer from '../util/apiRenderer';
import loginDialog from './loginDialog';
import searchBox from './searchBox';
import Routes from '../routes';

export default {
    data() {
        return {
            currentWindow: remote.getCurrentWindow(),
            isDarwin: process.platform === 'darwin',
            drawerOpen: false,
            dlgShow: false
        };
    },
    computed: {
        validRoutes() {
            return Routes.filter(r => r.icon);
        },
        currentSettings() {
            return this.$store.state.settings;
        },
        appbarDynamicClassName() {
            return [
                this.isDarwin && 'appbar-darwin',
                this.shouldWindowCtlShow && 'appbar-with-ctl'
            ];
        },
        shouldWindowCtlShow() {
            return !this.isDarwin && !this.currentSettings.windowBorder;
        },
        backgroundUrlStyle() {
            return this.user.bkgUrl && `background-image: url(${this.user.bkgUrl})`;
        },
        ...mapGetters([
            'loginValid',
            'user'
        ])
    },
    methods: {
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
        toggleDrawer() {
            this.drawerOpen = !this.drawerOpen;
        },
        handleNameClick() {
            if (!this.loginValid) {
                this.dlgShow = true;
            }
        },
        toggleDlg() {
            this.dlgShow = !this.dlgShow;
        },
        async handleCheckIn() {
            let results = [
                await ApiRenderer.postDailyTask(0),
                await ApiRenderer.postDailyTask(1)
            ];
            let points = 0;
            results.forEach(e => e.code === 200 ? points += e.point : null);
            if (points) {
                this.$toast(`签到成功，获得 ${points} 点积分`);
            } else {
                this.$toast('是不是已经签到过了呢 ：）');
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
    cursor: default;
    user-select: none;
    -webkit-app-region: drag;
    .mu-appbar {
        .left {
            cursor: pointer;
            -webkit-app-region: no-drag;
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

.appbar-with-ctl {
    .mu-appbar {
        padding-top: 16px;
    }
}

.appbar-no-ctl {
    .mu-appbar {
        padding-top: 0;
    }
    #appbar-window-control {
        display: none;
    }
}

.appbar-darwin {
    padding-top: 12px;
}

.appnav-drawer {
    padding-top: 0;
    .header {
        position: relative;
        width: 100%;
        height: 200px;
        background-size: cover;
        background-image: url(../../../assets/img/TealRedYellow.png);
        background-position-y: 50%;
        &::before {
            position: absolute;
            content: "cnt";
            color: transparent;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.2);
        }
        .user-info {
            position: absolute;
            padding: 2rem;
            bottom: 0;
            left: 0;
            .mu-avatar {
                display: block;
            }
            .user-name {
                margin-top: 1rem;
                color: white;
                font-size: 2rem;
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

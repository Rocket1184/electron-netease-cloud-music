<template>
    <div class="appbar"
         :class="appbarDynamicClassName">
        <div id="appbar-window-control"
             v-if="notDarwin">
            <mu-icon-button @click="handleClose"
                            icon="close" />
            <mu-icon-button @click="handleMaximize"
                            icon="keyboard_arrow_up" />
            <mu-icon-button @click="handleMinimize"
                            icon="keyboard_arrow_down" />
        </div>
        <mu-appbar title="Electron Netease Cloud Music">
            <mu-icon-button icon="menu"
                            slot="left"
                            @click="toggleDrawer" />
            <mu-text-field icon="search"
                           class="appbar-search-field"
                           slot="right"
                           hintText="搜索歌曲、歌单、用户" />
        </mu-appbar>
        <mu-drawer :width="300"
                   :open="drawerOpen"
                   :docked="false"
                   @close="toggleDrawer()">
            <mu-list class="appnav-drawer">
                <div class="header"
                     :style="backgroundUrlStyle">
                    <div class="user-info">
                        <mu-avatar :icon="userAvatarUrl ? null : 'music_note'"
                                   :src="userAvatarUrl"
                                   :iconSize="40"
                                   :size="80" />
                        <p class="user-name"
                           @click="handleNameClick">{{userName}}</p>
                    </div>
                </div>
                <router-link to='/'>
                    <mu-list-item title="个性推荐">
                        <mu-icon slot="left"
                                 value="polymer" />
                    </mu-list-item>
                </router-link>
                <router-link to="/myplaylist">
                    <mu-list-item title="我的歌单">
                        <mu-icon slot="left"
                                 value="library_music" />
                    </mu-list-item>
                </router-link>
                <mu-list-item title="听歌排行">
                    <mu-icon slot="left"
                             value="equalizer" />
                </mu-list-item>
                <mu-list-item title="本地音乐">
                    <mu-icon slot="left"
                             value="desktop_mac" />
                </mu-list-item>
                <mu-list-item title="应用设置">
                    <mu-icon slot="left"
                             value="settings" />
                </mu-list-item>
            </mu-list>
        </mu-drawer>
        <mu-dialog dialogClass="nav-login-dlg"
                   :open="dlgShow"
                   title="登录"
                   @close="toggleDlg">
            <mu-text-field label="用户名/邮箱/手机号"
                           inputClass="app-nav-input-account"
                           v-model="inputUsr"
                           :errorText="errMsgUsr"
                           fullWidth
                           labelFloat/>
            <br/>
            <mu-text-field label="密码"
                           id="app-nav-input-password"
                           type="password"
                           v-model="inputPwd"
                           :errorText="errMsgPwd"
                           fullWidth
                           labelFloat/>
            <br/>
            <br/>
            <mu-raised-button label="登录"
                              fullWidth
                              primary
                              @click="handleLogin" />
        </mu-dialog>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { ipcRenderer } from 'electron';

import ApiRenderer from '../util/apirenderer';
import * as types from '../vuex/mutation-types';

export default {
    data() {
        return {
            maximized: false,
            _inputAccountRef: null,
            notDarwin: process.platform !== 'darwin',
            drawerOpen: false,
            dlgShow: false,
            inputUsr: '',
            inputPwd: '',
            errMsgUsr: '',
            errMsgPwd: ''
        };
    },
    computed: {
        appbarDynamicClassName() {
            return [
                this.notDarwin && 'appbar-with-ctl',
                this.maximized && 'appbar-maximized'
            ];
        },
        backgroundUrlStyle() {
            return this.userBkgUrl && `background-image: url(${this.userBkgUrl})`;
        },
        ...mapGetters([
            'loginValid',
            'userName',
            'userBkgUrl',
            'userAvatarUrl'
        ])
    },
    methods: {
        handleClose() {
            ipcRenderer.send('closeMainWin');
        },
        handleMinimize() {
            ipcRenderer.send('minimizeMainWin');
        },
        handleMaximize() {
            this.maximized = ipcRenderer.sendSync('toggleMaximizeMainWin');
        },
        toggleDrawer() {
            this.drawerOpen = !this.drawerOpen;
        },
        handleNameClick() {
            if (!this.loginValid) {
                this.dlgShow = true;
                setTimeout(() => this._inputAccountRef.focus(), 200);
            }
        },
        toggleDlg() {
            this.dlgShow = !this.dlgShow;
        },
        async handleLogin() {
            this.errMsgUsr = '';
            this.errMsgPwd = '';
            if (!this.inputUsr) return this.errMsgUsr = '用户名不能为空';
            if (!this.inputPwd) return this.errMsgPwd = '密码不能为空';
            let resp = await ApiRenderer.login(this.inputUsr, this.inputPwd);
            switch (resp.code) {
                case 200:
                    const userCookie = await ApiRenderer.getCookie();
                    this.$store.commit({
                        type: types.UPDATE_USER_INFO,
                        ...resp
                    });
                    this.$store.commit({
                        type: types.SET_LOGIN_VALID
                    });
                    this.$store.commit({
                        type: types.UPDATE_USER_COOKIES,
                        cookie: userCookie
                    });
                    this.toggleDlg();
                    localStorage.setItem('cookie', JSON.stringify(userCookie));
                    localStorage.setItem('user', JSON.stringify(resp));
                    localStorage.setItem('uid', resp.account.id);
                    break;
                case 501:
                    this.errMsgUsr = '用户不存在';
                    break;
                case 502:
                    this.errMsgPwd = '密码错误';
            }
        }
    },
    created() {
        this.$router.afterEach(() => this.drawerOpen = false);
    },
    mounted() {
        this._inputAccountRef = document.getElementsByClassName('app-nav-input-account')[0];
        const pwd = document.getElementById('app-nav-input-password');
        pwd.addEventListener('keydown', e => e.key === 'Enter' && this.handleLogin());
        window.onresize = () => {
            this.maximized = ipcRenderer.sendSync('isMainWinMaximized');
        };
    }
};
</script>

<style lang="less">
.appbar {
    cursor: default;
    user-select: none;
    -webkit-app-region: drag;
    .mu-appbar {
        padding-top: 12px;
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

.appbar-maximized {
    .mu-appbar {
        padding-top: 0;
    }
    #appbar-window-control {
        visibility: hidden;
    }
}

.appbar-search-field {
    color: #FFF;
    margin-bottom: 0;
    -webkit-app-region: no-drag;
    &.focus-state {
        color: #FFF;
    }
    .mu-text-field-hint {
        color: fade(#FFF, 54%);
    }
    .mu-text-field-input {
        color: #FFF;
    }
    .mu-text-field-focus-line {
        background-color: #FFF;
    }
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
        }
        .user-name {
            margin-top: 1rem;
            color: white;
            font-size: 2rem;
            cursor: pointer;
        }
    }
}

.nav-login-dlg {
    width: 400px;
}
</style>

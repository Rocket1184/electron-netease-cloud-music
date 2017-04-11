<template>
    <div class="appbar">
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
                <mu-list-item title="听歌排行">
                    <mu-icon slot="left"
                             value="equalizer" />
                </mu-list-item>
                <mu-list-item title="我的歌单">
                    <mu-icon slot="left"
                             value="library_music" />
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
                           v-model="inputUsr"
                           :errorText="errMsgUsr"
                           fullWidth
                           labelFloat/>
            <br/>
            <mu-text-field label="密码"
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

import ApiRenderer from '../util/apirenderer';
import * as types from '../vuex/mutation-types';

export default {
    data() {
        return {
            drawerOpen: false,
            dlgShow: false,
            inputUsr: '',
            inputPwd: '',
            errMsgUsr: '',
            errMsgPwd: ''
        };
    },
    computed: {
        backgroundUrlStyle() {
            return this.userBkgUrl && `background-image: url(${this.userBkgUrl})`;
        },
        ...mapGetters([
            'userName',
            'userBkgUrl',
            'userAvatarUrl'
        ])
    },
    methods: {
        toggleDrawer() {
            this.drawerOpen = !this.drawerOpen;
        },
        handleNameClick() {
            if (!this.$store.state.user.loginValid)
                this.dlgShow = true;
        },
        toggleDlg() {
            this.dlgShow = !this.dlgShow;
        },
        async handleLogin() {
            this.errMsgUsr = '';
            this.errMsgPwd = '';
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
                    localStorage.setItem('cookie', JSON.stringify(userCookie));
                    localStorage.setItem('uid', resp.account.id);
                    this.toggleDlg();
                    break;
                case 501:
                    this.errMsgUsr = '用户不存在';
                    break;
                case 502:
                    this.errMsgPwd = '密码错误';
            }
        }
    }
};
</script>

<style lang="less">
.appbar {
    -webkit-app-region: drag;
    .mu-appbar .left {
        -webkit-app-region: no-drag;
    }
}

.appbar-search-field {
    color: #FFF;
    margin-bottom: 0;
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

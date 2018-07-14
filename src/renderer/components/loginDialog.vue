<template>
    <mu-dialog :open="show"
        dialogClass="nav-login-dlg"
        bodyClass="dlg-body"
        @close="$emit('close')">
        <mu-tabs :value="loginType"
            class="login-tabs"
            lineClass="tab-line"
            @change="handleTabChange">
            <mu-tab value="app"
                title="应用内登录"></mu-tab>
            <mu-tab value="web"
                title="网页登录"></mu-tab>
        </mu-tabs>
        <div class="login-types">
            <div v-show="loginType === 'web'">
                <mu-stepper :activeStep="webLoginStep"
                    orientation="vertical">
                    <mu-step>
                        <mu-step-label>进行网页登录</mu-step-label>
                        <mu-step-content>
                            <mu-raised-button label="点我打开登录页面"
                                fullWidth
                                primary
                                @click="openLoginWeb()"></mu-raised-button>
                        </mu-step-content>
                    </mu-step>
                    <mu-step>
                        <mu-step-label>确认登录成功</mu-step-label>
                        <mu-step-content>
                            <div class="web-login-step-2-content">
                                <mu-flat-button label="上一步"
                                    @click="webLoginStep--"></mu-flat-button>
                                <mu-raised-button label="完成"
                                    primary
                                    @click="handleWebLoginComplete()"></mu-raised-button>
                            </div>
                        </mu-step-content>
                    </mu-step>
                </mu-stepper>
            </div>
            <div v-show="loginType === 'app'">
                <mu-text-field label="邮箱 / 手机号码"
                    inputClass="app-nav-input-account"
                    v-model="inputUsr"
                    :errorText="errMsgUsr"
                    fullWidth
                    labelFloat></mu-text-field>
                <mu-text-field label="密码"
                    id="app-nav-input-password"
                    type="password"
                    v-model="inputPwd"
                    :errorText="errMsgPwd"
                    fullWidth
                    labelFloat></mu-text-field>
                <div v-if="needCaptcha">
                    <mu-text-field label="验证码"
                        class="text-field-captcha"
                        v-model="inputCaptcha"
                        :errorText="errMsgCaptcha"
                        labelFloat></mu-text-field>
                    <img :src="`https://music.163.com/captcha?id=${captchaId}`"
                        class="captforce-alignedcha-img"
                        alt="Refresh">
                </div>
                <mu-raised-button label="登录"
                    fullWidth
                    primary
                    @click="handleLogin()"
                    :disabled="posting"></mu-raised-button>
            </div>
        </div>
    </mu-dialog>
</template>

<script>
import { mapActions } from 'vuex';
import { ipcRenderer } from 'electron';

import ApiRenderer from '@/util/apiRenderer';

function initData() {
    return {
        webLoginStep: 0,
        loginType: 'app',
        inputUsr: '',
        inputPwd: '',
        errMsgUsr: '',
        errMsgPwd: '',
        needCaptcha: false,
        captchaId: null,
        inputCaptcha: '',
        errMsgCaptcha: '',
        posting: false
    };
}

export default {
    props: {
        show: {
            type: Boolean,
            required: true
        }
    },
    data: initData,
    methods: {
        ...mapActions([
            'setUserInfo',
            'storeUserInfo',
            'setLoginValid',
            'restoreUserInfo'
        ]),
        handleTabChange(val) {
            this.loginType = val;
        },
        async handleLogin() {
            this.errMsgUsr = '';
            this.errMsgPwd = '';
            if (!this.inputUsr) return this.errMsgUsr = '邮箱 / 手机号码 不能为空';
            if (!this.inputPwd) return this.errMsgPwd = '密码不能为空';
            this.posting = true;
            // TODO: Login with captcha
            let resp = await ApiRenderer.login(this.inputUsr, this.inputPwd);
            this.posting = false;
            switch (resp.code) {
                case 200:
                    this.$emit('close');
                    this.setUserInfo(resp);
                    this.setLoginValid();
                    const cookie = await ApiRenderer.getCookie();
                    this.storeUserInfo({ user: resp, cookie });
                    break;
                case 415:
                    this.errMsgCaptcha = '登录过于频繁，请输入验证码';
                    this.captchaId = resp.captchaId;
                    this.needCaptcha = true;
                    break;
                case 501:
                    this.errMsgUsr = '用户不存在';
                    break;
                case 502:
                    this.errMsgPwd = '密码错误';
                    break;
                default:
                    this.errMsgUsr = resp.msg;
            }
        },
        bindKeybordEvent() {
            const inputAccRef = document.querySelector('.app-nav-input-account');
            const inputPwdRef = document.querySelector('#app-nav-input-password');
            inputPwdRef.onkeydown = e => {
                if (e.key === 'Enter') this.handleLogin();
            };
            setTimeout(() => inputAccRef.focus(), 200);
        },
        openLoginWeb() {
            this.webLoginStep++;
            ipcRenderer.send('showLoginWindow');
        },
        async handleWebLoginComplete() {
            const valid = await this.restoreUserInfo();
            if (valid) {
                this.$emit('close');
            } else {
                this.$toast('根本没有登录成功啊喂 (╯‵□′)╯︵┻━┻');
            }
            this.webLoginStep = 0;
        }
    },
    watch: {
        show(val) {
            if (val === true) {
                this.$nextTick(this.bindKeybordEvent);
            } else {
                Object.assign(this.$data, initData());
            }
        }
    }
};
</script>

<style lang="less">
.nav-login-dlg {
    @theme-color: #7e57c2;
    width: 400px;
    .dlg-body {
        padding: 0;
        .login-types {
            margin: 20px;
        }
    }
    .login-tabs {
        margin-bottom: 20px;
        background-color: transparent;
        .mu-tab-link-highlight {
            background-color: @theme-color;
        }
        .mu-tab-link {
            color: grey;
        }
        .mu-tab-active {
            color: @theme-color;
        }
    }
    .tab-line {
        background-color: @theme-color;
    }
    .web-login-step-2-content {
        margin-top: 5px;
        display: flex;
        justify-content: space-between;
    }
    .text-field-captcha {
        display: inline-block;
        width: 200px;
    }
    .captcha-img {
        width: 122px;
        height: 60px;
        float: right;
    }
}
</style>

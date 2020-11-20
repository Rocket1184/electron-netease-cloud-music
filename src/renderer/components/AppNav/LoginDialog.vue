<template>
    <mu-dialog :open="show"
        dialog-class="nav-login-dlg"
        @close="$emit('update:show', false)">
        <mu-tabs :value="loginType"
            inverse
            full-width
            @change="handleTabChange">
            <mu-tab value="app">应用内登录</mu-tab>
            <mu-tab value="web">网页登录</mu-tab>
        </mu-tabs>
        <div class="login-types">
            <div v-show="loginType === 'web'">
                <mu-stepper :active-step="webLoginStep"
                    orientation="vertical">
                    <mu-step>
                        <mu-step-label>进行网页登录</mu-step-label>
                        <mu-step-content>
                            <div class="web-login-step-1-content">
                                <mu-button full-width
                                    color="primary"
                                    @click="openLoginWeb()">打开登录页面</mu-button>
                            </div>
                        </mu-step-content>
                    </mu-step>
                    <mu-step>
                        <mu-step-label>确认登录成功</mu-step-label>
                        <mu-step-content>
                            <div class="web-login-step-2-content">
                                <mu-button flat
                                    @click="webLoginStep = 0">上一步</mu-button>
                                <mu-button color="primary"
                                    @click="handleWebLoginComplete()">完成</mu-button>
                            </div>
                        </mu-step-content>
                    </mu-step>
                </mu-stepper>
            </div>
            <div v-show="loginType === 'app'">
                <mu-text-field label="邮箱 / 手机号码"
                    ref="inputUsr"
                    v-model="inputUsr"
                    :error-text="errMsgUsr"
                    full-width
                    label-float></mu-text-field>
                <mu-text-field label="密码"
                    ref="inputPwd"
                    type="password"
                    v-model="inputPwd"
                    :error-text="errMsgPwd"
                    full-width
                    label-float></mu-text-field>
                <div v-if="needCaptcha">
                    <mu-text-field label="验证码"
                        ref="inputCaptcha"
                        class="text-field-captcha"
                        v-model="inputCaptcha"
                        :error-text="errMsgCaptcha"
                        label-float></mu-text-field>
                    <img :src="`https://music.163.com/captcha?id=${captchaId}`"
                        class="captcha-img">
                </div>
                <mu-button full-width
                    color="primary"
                    @click="handleLogin()"
                    :disabled="loginPending">登录</mu-button>
            </div>
        </div>
    </mu-dialog>
</template>

<script>
import Api from '@/api/ipc';

import { ipcRenderer } from 'electron';
import { mapActions } from 'vuex';

function initData() {
    return {
        webLoginStep: 0,
        loginType: 'app',
        loginPending: false,
        inputUsr: '',
        inputPwd: '',
        errMsgUsr: '',
        errMsgPwd: '',
        needCaptcha: false,
        captchaId: null,
        inputCaptcha: '',
        errMsgCaptcha: ''
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
            'login',
            'restoreUserInfo'
        ]),
        handleTabChange(val) {
            this.loginType = val;
        },
        async handleLogin() {
            this.errMsgUsr = '';
            this.errMsgPwd = '';
            this.errMsgCaptcha = '';
            if (!this.inputUsr) {
                this.$refs.inputUsr.$el.querySelector('input').focus();
                return this.errMsgUsr = '邮箱 / 手机号码 不能为空';
            }
            if (!this.inputPwd) {
                this.$refs.inputPwd.$el.querySelector('input').focus();
                return this.errMsgPwd = '密码不能为空';
            }
            if (this.needCaptcha && this.captchaId && !this.inputCaptcha) {
                this.$refs.inputCaptcha.$el.querySelector('input').focus();
                return this.errMsgCaptcha = '请输入验证码';
            }
            this.loginPending = true;
            if (this.needCaptcha) {
                const { code, result, captchaId } = await Api.verifyCaptcha(this.captchaId, this.inputCaptcha);
                this.captchaId = captchaId;
                this.inputCaptcha = '';
                if (code !== 200) {
                    this.errMsgCaptcha = `${code}：提交验证码失败`;
                    this.loginPending = false;
                    return;
                }
                if (result !== true) {
                    this.errMsgCaptcha = '验证码错误';
                    this.loginPending = false;
                    return;
                }
                this.needCaptcha = false;
            }
            let phone = '';
            let countrycode = '86';
            const match = this.inputUsr.match(/^\+?(?<countrycode>\d*)\s(?<phone>\d*)$/);
            if (match) {
                phone = match.groups.phone;
                countrycode = match.groups.countrycode;
            }
            let resp = await this.login({ acc: phone || this.inputUsr, pwd: this.inputPwd, countrycode });
            switch (resp.code) {
                case 200:
                    this.$emit('update:show', false);
                    break;
                case 415:
                    this.$refs.inputCaptcha.$el.querySelector('input').focus();
                    this.errMsgCaptcha = '登录过于频繁，请输入验证码';
                    this.captchaId = resp.captchaId;
                    this.needCaptcha = true;
                    break;
                case 501:
                    this.$refs.inputUsr.$el.querySelector('input').select();
                    this.errMsgUsr = '用户不存在';
                    break;
                case 502:
                    this.$refs.inputPwd.$el.querySelector('input').select();
                    this.errMsgPwd = '密码错误';
                    break;
                default:
                    this.errMsgUsr = resp.msg || resp.message;
            }
            this.loginPending = false;
        },
        bindKeybordEvent() {
            this.$refs.inputPwd.$el.querySelector('input').onkeydown = e => {
                if (e.key === 'Enter') this.handleLogin();
            };
            setTimeout(() => this.$refs.inputUsr.$el.querySelector('input').focus(), 200);
        },
        openLoginWeb() {
            ipcRenderer.send('showLoginWindow');
            setTimeout(() => this.webLoginStep = 1, 1000);
        },
        requestLoginCookies() {
            return new Promise((resolve, reject) => {
                ipcRenderer.send('getLoginCookie');
                ipcRenderer.once('getLoginCookie', (event, cookie) => {
                    resolve(cookie);
                });
                setTimeout(reject, 1000);
            });
        },
        async handleWebLoginComplete() {
            try {
                const cookie = await this.requestLoginCookies();
                await this.restoreUserInfo(cookie);
                this.$emit('update:show', false);
            } catch (e) {
                const msg = e ? e.msg : '';
                this.$toast.message(msg || '根本没有登录成功啊喂 (╯‵□′)╯︵┻━┻');
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
    width: 400px;
    .mu-dialog-body {
        padding: 0;
        .login-types {
            margin: 20px;
        }
    }
    .web-login-step-1-content {
        padding-bottom: 4px;
    }
    .web-login-step-2-content {
        padding: 4px 0;
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

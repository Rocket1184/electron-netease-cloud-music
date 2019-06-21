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
                                    @click="openLoginWeb()">点我打开登录页面</mu-button>
                            </div>
                        </mu-step-content>
                    </mu-step>
                    <mu-step>
                        <mu-step-label>确认登录成功</mu-step-label>
                        <mu-step-content>
                            <div class="web-login-step-2-content">
                                <mu-button flat
                                    @click="webLoginStep--">上一步</mu-button>
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
                        class="text-field-captcha"
                        v-model="inputCaptcha"
                        :error-text="errMsgCaptcha"
                        label-float></mu-text-field>
                    <img :src="`https://music.163.com/captcha?id=${captchaId}`"
                        class="captcha-img"
                        alt="Refresh">
                </div>
                <mu-button full-width
                    color="primary"
                    @click="handleLogin()"
                    :disabled="ui.loginPending">登录</mu-button>
            </div>
        </div>
    </mu-dialog>
</template>

<script>
import { ipcRenderer } from 'electron';
import { mapActions, mapState } from 'vuex';

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
    computed: {
        ...mapState(['ui'])
    },
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
            if (!this.inputUsr) {
                this.$refs.inputUsr.$el.querySelector('input').focus();
                return this.errMsgUsr = '邮箱 / 手机号码 不能为空';
            }
            if (!this.inputPwd) {
                this.$refs.inputPwd.$el.querySelector('input').focus();
                return this.errMsgPwd = '密码不能为空';
            }
            // TODO: Login with captcha
            let resp = await this.login({ acc: this.inputUsr, pwd: this.inputPwd });
            switch (resp.code) {
                case 200:
                    this.$emit('update:show', false);
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
            this.$refs.inputPwd.$el.querySelector('input').onkeydown = e => {
                if (e.key === 'Enter') this.handleLogin();
            };
            setTimeout(() => this.$refs.inputUsr.$el.querySelector('input').focus(), 200);
        },
        openLoginWeb() {
            this.webLoginStep++;
            ipcRenderer.send('showLoginWindow');
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
            const cookie = await this.requestLoginCookies();
            const valid = await this.restoreUserInfo(cookie);
            if (valid) {
                this.$emit('update:show', false);
            } else {
                this.$toast.message('根本没有登录成功啊喂 (╯‵□′)╯︵┻━┻');
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

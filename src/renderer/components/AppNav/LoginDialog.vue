<template>
    <mu-dialog :open="show"
        dialog-class="nav-login-dlg"
        @close="$emit('update:show', false)">
        <mu-tabs :value.sync="type"
            inverse
            full-width
            @change="prepareLoginMethod">
            <mu-tab value="pwd">密码登录</mu-tab>
            <mu-tab value="web">网页登录</mu-tab>
        </mu-tabs>
        <div class="login-types">
            <div v-if="type === 'web'">
                <mu-stepper :active-step="web.step"
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
                                    @click="web.step = 0">上一步</mu-button>
                                <mu-button color="primary"
                                    @click="handleWebLoginComplete()">完成</mu-button>
                            </div>
                        </mu-step-content>
                    </mu-step>
                </mu-stepper>
            </div>
            <div v-else-if="type === 'pwd'">
                <mu-text-field label="邮箱 / 手机号码"
                    ref="inputUsr"
                    v-model="pwd.usr"
                    :error-text="pwd.usrMsg"
                    full-width
                    label-float></mu-text-field>
                <mu-text-field label="密码"
                    ref="inputPwd"
                    type="password"
                    v-model="pwd.pwd"
                    :error-text="pwd.pwdMsg"
                    full-width
                    label-float></mu-text-field>
                <div v-if="pwd.needsCaptcha">
                    <mu-text-field label="验证码"
                        ref="inputCaptcha"
                        class="text-field-captcha"
                        v-model="pwd.captcha"
                        :error-text="pwd.captchaMsg"
                        label-float></mu-text-field>
                    <img :src="`https://music.163.com/captcha?id=${pwd.captchaId}`"
                        class="captcha-img">
                </div>
                <mu-button full-width
                    color="primary"
                    @click="handlePasswordLogin()"
                    :disabled="pwd.pending">登录</mu-button>
            </div>
        </div>
    </mu-dialog>
</template>

<script>
import { mapActions } from 'vuex';

import Api from '@/api/ipc';
import { encm } from '@/util/globals';

export default {
    props: {
        show: {
            type: Boolean,
            required: true
        }
    },
    data: () => ({
        type: 'pwd',
        pwd: {
            usr: '',
            usrMsg: '',
            pwd: '',
            pwdMsg: '',
            needsCaptcha: false,
            captchaId: null,
            captcha: '',
            captchaMsg: '',
            pending: false
        },
        web: {
            step: 0
        }
    }),
    methods: {
        resetData() {
            this.pwd = {
                usr: '',
                usrMsg: '',
                pwd: '',
                pwdMsg: '',
                needsCaptcha: false,
                captchaId: null,
                captcha: '',
                captchaMsg: '',
                pending: false
            };
            this.web = {
                step: 0
            };
        },
        ...mapActions([
            'login',
            'restoreUserInfo'
        ]),
        async handlePasswordLogin() {
            this.pwd.usrMsg = '';
            this.pwd.pwdMsg = '';
            this.pwd.captchaMsg = '';
            if (!this.pwd.usr) {
                this.$refs.inputUsr.$el.querySelector('input').focus();
                return this.pwd.usrMsg = '邮箱 / 手机号码 不能为空';
            }
            if (!this.pwd.pwd) {
                this.$refs.inputPwd.$el.querySelector('input').focus();
                return this.pwd.pwdMsg = '密码不能为空';
            }
            if (this.pwd.needsCaptcha && this.pwd.captchaId && !this.pwd.captcha) {
                this.$refs.inputCaptcha.$el.querySelector('input').focus();
                return this.pwd.captchaMsg = '请输入验证码';
            }
            this.pwd.pending = true;
            if (this.pwd.needsCaptcha) {
                const { code, result, captchaId } = await Api.verifyCaptcha(this.pwd.captchaId, this.pwd.captcha);
                this.pwd.captchaId = captchaId;
                this.pwd.captcha = '';
                if (code !== 200) {
                    this.pwd.captchaMsg = `${code}：提交验证码失败`;
                    this.pwd.pending = false;
                    return;
                }
                if (result !== true) {
                    this.pwd.captchaMsg = '验证码错误';
                    this.pwd.pending = false;
                    return;
                }
                this.pwd.needsCaptcha = false;
            }
            let phone = '';
            let countrycode = '86';
            const match = this.pwd.usr.match(/^\+?(?<countrycode>\d*)\s(?<phone>\d*)$/);
            if (match) {
                phone = match.groups.phone;
                countrycode = match.groups.countrycode;
            }
            let resp = await this.login({ acc: phone || this.pwd.usr, pwd: this.pwd.pwd, countrycode });
            switch (resp.code) {
                case 200:
                    this.$emit('update:show', false);
                    break;
                case 400:
                    this.$alert(`密码登录可能被风控，请尝试“网页登录”。错误信息：“\n${resp.message}”`, {
                        title: '登录失败'
                    });
                    break;
                case 415:
                    this.$refs.inputCaptcha.$el.querySelector('input').focus();
                    this.pwd.captchaMsg = '登录过于频繁，请输入验证码';
                    this.pwd.captchaId = resp.captchaId;
                    this.pwd.needsCaptcha = true;
                    break;
                case 501:
                    this.$refs.inputUsr.$el.querySelector('input').select();
                    this.pwd.usrMsg = '用户不存在';
                    break;
                case 502:
                    this.$refs.inputPwd.$el.querySelector('input').select();
                    this.pwd.pwdMsg = '密码错误';
                    break;
                default:
                    this.pwd.usrMsg = resp.msg || resp.message;
            }
            this.pwd.pending = false;
        },
        bindKeyboardEvent() {
            this.$refs.inputPwd.$el.querySelector('input').onkeydown = e => {
                if (e.key === 'Enter') this.handlePasswordLogin();
            };
            setTimeout(() => this.$refs.inputUsr.$el.querySelector('input').focus(), 200);
        },
        removeKeyboardEvent() {
            this.$refs.inputPwd.$el.querySelector('input').onkeydown = null;
        },
        openLoginWeb() {
            encm.send('showLoginWindow');
            setTimeout(() => this.web.step = 1, 1000);
        },
        async handleWebLoginComplete() {
            try {
                const cookie = await Promise.race([
                    new Promise((_, reject) => setTimeout(reject, 1000)),
                    encm.invoke('getLoginCookie')
                ]);
                await this.restoreUserInfo(cookie);
                this.$emit('update:show', false);
            } catch (e) {
                const msg = e ? e.msg : '';
                this.$toast.message(msg || '根本没有登录成功啊喂 (╯‵□′)╯︵┻━┻');
            }
            this.web.step = 0;
        },
        prepareLoginMethod() {
            switch (this.type) {
                case 'pwd':
                    this.$nextTick(this.bindKeyboardEvent);
                    break;
            }
        }
    },
    watch: {
        show(val) {
            if (val === true) {
                this.prepareLoginMethod();
            } else {
                this.resetData();
                switch (this.type) {
                    case 'pwd':
                        this.removeKeyboardEvent();
                        break;
                }
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

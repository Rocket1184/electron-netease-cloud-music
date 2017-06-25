<template>
    <mu-dialog dialogClass="nav-login-dlg"
        :open="show"
        title="登录"
        @close="$emit('close')">
        <mu-text-field label="用户名/邮箱/手机号"
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
            <img :src="`http://music.163.com/captcha?id=${captchaId}`"
                class="captforce-alignedcha-img"
                alt="Refresh">
        </div>
        <mu-raised-button label="登录"
            fullWidth
            primary
            @click="handleLogin()"
            :disabled="posting"></mu-raised-button>
    </mu-dialog>
</template>

<script>
import { mapActions } from 'vuex';

import ApiRenderer from '../util/apiRenderer';

export default {
    props: {
        show: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
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
    },
    methods: {
        ...mapActions([
            'setUserInfo'
        ]),
        async handleLogin() {
            this.errMsgUsr = '';
            this.errMsgPwd = '';
            if (!this.inputUsr) return this.errMsgUsr = '用户名不能为空';
            if (!this.inputPwd) return this.errMsgPwd = '密码不能为空';
            this.posting = true;
            // TODO: Login with captcha
            let resp = await ApiRenderer.login(this.inputUsr, this.inputPwd);
            this.posting = false;
            switch (resp.code) {
                case 200:
                    this.$emit('close');
                    const cookie = await ApiRenderer.getCookie();
                    this.setUserInfo({ cookie, info: resp });
                    localStorage.setItem('cookie', JSON.stringify(cookie));
                    localStorage.setItem('user', JSON.stringify(resp));
                    localStorage.setItem('uid', resp.account.id);
                    break;
                case 415:
                    this.errMsgCaptcha = '登录过于频繁，请输入验证码';
                    this.captchaId = resp.captchaId;
                    this.needCaptcha = true;
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
        resetData() {
            this.inputUsr = '';
            this.inputPwd = '';
            this.errMsgUsr = '';
            this.errMsgPwd = '';
            this.needCaptcha = false;
            this.captchaId = null;
            this.inputCaptcha = '';
            this.errMsgCaptcha = '';
            this.posting = false;
        }
    },
    watch: {
        show(val) {
            if (val === true) {
                this.$nextTick(this.bindKeybordEvent);
            } else {
                this.resetData();
            }
        }
    }
};
</script>


<style lang="less">
.nav-login-dlg {
    width: 400px;
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

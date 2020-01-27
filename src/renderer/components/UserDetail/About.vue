<template>
    <div class="user-about">
        <template v-if="user.profile.allAuthTypes">
            <h2 class="subhead">认证信息</h2>
            <template v-for="(a, i) in user.profile.allAuthTypes">
                <p class="para"
                    v-if="a.desc.length > 0"
                    :key="i">
                    <TypeBadge class="auth-badge"
                        :type="a.type"></TypeBadge>
                    <span class="auth-desc">{{ a.desc }}</span>
                </p>
            </template>
        </template>
        <h2 class="subhead">个人信息</h2>
        <p class="para">等级：<span>{{ user.level }}</span></p>
        <p v-if="age"
            class="para">年龄：<span>{{ age }}</span></p>
        <p v-if="city"
            class="para">地区：<span>{{ city }}</span></p>
        <template v-if="user.profile.signature">
            <h2 class="subhead">个人介绍</h2>
            <p class="para user-sign">{{ user.profile.signature }}</p>
        </template>
    </div>
</template>

<script>
import districts from 'v-distpicker/src/districts';

import TypeBadge from './TypeBadge.vue';

export default {
    props: {
        user: {
            required: true
        }
    },
    computed: {
        age() {
            const b = this.user.profile.birthday;
            if (b <= -2209017600000) return null;
            const dt = new Date(b + 8 * 3600 * 1000);
            const m = dt.getUTCMonth() + 1;
            const d = dt.getUTCDate();
            const a = '魔羯水瓶双鱼牡羊金牛双子巨蟹狮子处女天秤天蝎射手魔羯'.substr(m * 2 - (d < '102123444543'[m - 1] - -19) * 2, 2);
            const y = Math.floor(dt.getUTCFullYear() % 100 / 10) * 10;
            return `${y || '00'} 后 ${a}座`;
        },
        city() {
            const code = this.user.profile.city;
            if (code <= 100) return null;
            let result = '';
            const c0 = 100000;
            const c1 = Math.floor(code / 10000) * 10000;
            const r1 = districts[c0][c1];
            if (!r1) return result;
            result += r1;
            const c2 = Math.floor(code / 100) * 100;
            const r2 = districts[c1][c2];
            if (!r2) return result;
            result += ' ' + r2;
            const r3 = districts[c2][code];
            if (!r3) return result;
            result += ' ' + r3;
            return result;
        },
    },
    components: {
        TypeBadge
    }
};
</script>

<style lang="less">
.user-about {
    padding: 4px 50px 16px;
    .subhead {
        margin: 12px 0;
        font-size: 16px;
        font-weight: bold;
    }
    .para {
        font-size: 14px;
        margin: 0;
        line-height: 22px;
    }
    .auth-badge,
    .auth-desc {
        vertical-align: middle;
    }
    .auth-badge {
        position: static;
        width: 16px;
        height: 16px;
        display: inline-block;
        margin-right: 4px;
    }
    .user-sign {
        white-space: pre-wrap;
    }
}
</style>

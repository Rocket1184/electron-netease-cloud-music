<template>
    <mu-list-item class="user-item"
        button
        :to="route">
        <div class="user-avatar-wrapper">
            <img class="user-avatar"
                :src="avatar">
            <TypeBadge v-if="user.userType"
                :type="user.userType"></TypeBadge>
        </div>
        <mu-list-item-content>
            <mu-list-item-title>{{ user.nickname }}
                <GenderIcon v-if="user.gender"
                    :gender="user.gender"></GenderIcon>
            </mu-list-item-title>
            <mu-list-item-sub-title v-if="user.signature">{{ user.signature }}</mu-list-item-sub-title>
        </mu-list-item-content>
    </mu-list-item>
</template>

<script>
import { sizeImg, HiDpiPx } from '@/util/image';

import TypeBadge from '@/components/UserDetail/TypeBadge.vue';
import GenderIcon from '@/components/UserDetail/GenderIcon.vue';

export default {
    props: {
        user: {
            required: true
        },
    },
    computed: {
        route() {
            return { name: 'user', params: { id: this.user.userId } };
        },
        avatar() {
            return sizeImg(this.user.avatarUrl, HiDpiPx(50));
        },
        follows() {
            return `关注 ${this.user.follows}｜粉丝 ${this.user.followeds}`;
        },
        followBtn() {
            return this.user.followed
                ? { icon: 'done', text: '已关注', color: 'primary' }
                : { icon: 'add', text: '关注', color: '' };
        }
    },
    components: {
        TypeBadge,
        GenderIcon
    }
};
</script>

<style lang="less">
.user-item {
    cursor: pointer;
    .user-avatar-wrapper {
        height: 50px;
        margin-right: 16px;
        position: relative;
    }
    .user-avatar {
        width: 50px;
        height: 50px;
        border-radius: 25px;
    }
}
</style>

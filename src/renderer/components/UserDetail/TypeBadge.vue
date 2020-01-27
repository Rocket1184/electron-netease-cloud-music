<template>
    <div class="user-type-badge"
        :class="userType.class"
        :title="userType.name">
        <mu-icon slot="content"
            size="14"
            color="white"
            :value="userType.icon"></mu-icon>
    </div>
</template>

<script>
export const UserType = {
    2: { icon: 'check', class: 'user-type-red', name: '认证音乐人' },
    3: { icon: 'check', class: 'user-type-red', name: '认证的官方帐号' },
    4: { icon: 'music_note', class: 'user-type-red', name: '网易音乐人' },
    10: { icon: 'check', class: 'user-type-red', name: '认证的官方帐号' },
    200: { icon: 'star_border', class: 'user-type-yellow', name: '云音乐达人' },
    201: { icon: 'star_border', class: 'user-type-yellow', name: '云音乐达人' },
    202: { icon: 'star_border', class: 'user-type-yellow', name: '云音乐达人' }
};

export const DefaultUserType = {
    icon: 'help_outline',
    class: 'user-type-unknown',
    name: '未知的用户类型，快来 GitHub 开个 Issue ！',
    unknown: true
};

export default {
    props: {
        type: {
            type: [Number, String],
            required: true
        }
    },
    computed: {
        userType() {
            return UserType[this.type] || DefaultUserType;
        }
    }
};
</script>

<style lang="less">
.user-type-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    border-radius: 50%;
    padding: 1px;
    font-size: 0;
}
.user-type-red {
    background-color: #f44336; // red500
}
.user-type-yellow {
    background-color: #fbc02d; // yellow700
}
.user-type-unknown {
    background-color: lightslategrey;;
}
</style>

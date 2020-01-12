<template>
    <ListDetailLayout class="ncm-page profile"
        showBack>
        <template #list>
            <mu-list class="logout">
                <mu-list-item button
                    @click="handleLogout">
                    <mu-list-item-action>
                        <mu-icon value="power_settings_new"></mu-icon>
                    </mu-list-item-action>
                    <mu-list-item-title>退出登录</mu-list-item-title>
                </mu-list-item>
            </mu-list>
        </template>
        <UserDetail :user="profileToShow"></UserDetail>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Api from '@/api/ipc';

import UserDetail from '@/components/UserDetail/UserDetail.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

export default {
    data() {
        return {
            profile: null
        };
    },
    computed: {
        ...mapState(['user']),
        profileToShow() {
            return this.profile || this.user.info;
        }
    },
    methods: {
        ...mapActions([
            'logout',
            'getUserInfo'
        ]),
        getProfile() {
            Api.getUserInfo(this.user.info.id).then(r => {
                if (r.code === 200) {
                    this.profile = r;
                }
            });
        },
        handleLogout() {
            this.$confirm(
                '退出登录后将无法查看每日歌曲推荐，收藏的歌单等信息，确定吗？',
                '退出登录'
            ).then(({ result }) => {
                if (result) {
                    window.__NAV_BACK__ = true;
                    this.$router.replace({ name: 'index' });
                    this.logout();
                }
            });
        }
    },
    mounted() {
        this.getProfile();
    },
    components: {
        UserDetail,
        ListDetailLayout
    }
};
</script>

<style lang="less">
.profile {
    .logout {
        margin-top: auto;
    }
}
</style>

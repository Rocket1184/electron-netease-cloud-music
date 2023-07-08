<template>
    <ListDetailLayout class="ncm-page"
        showBack
        :detailLoading="detailLoading">
        <CenteredTip v-if="!user"
            icon="person_outline"
            tip="查无此人 ..."></CenteredTip>
        <UserDetail v-else
            :user="user"></UserDetail>
    </ListDetailLayout>
</template>

<script>
import Api from '@/api/ipc';

import UserDetail from '@/components/UserDetail/UserDetail.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';
import CenteredTip from '@/components/CenteredTip.vue';

export default {
    props: {
        id: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            /** @type {Types.UserInfoRes} */
            user: null,
            detailLoading: true
        };
    },
    methods: {
        async loadUser() {
            this.detailLoading = true;
            const res = await Api.getUserInfo(this.id);
            if (res.code === 200) {
                this.user = res;
            }
            this.detailLoading = false;
        }
    },
    mounted() {
        this.loadUser();
    },
    beforeRouteUpdate(to, from, next) {
        // this component is reused in the new route
        next();
        this.$nextTick(() => this.loadUser());
    },
    components: {
        UserDetail,
        ListDetailLayout,
        CenteredTip
    }
};
</script>

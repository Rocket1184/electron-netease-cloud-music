import { SET_LOGIN_VALID } from '@/store/mutation-types';

export const FetchOnLoginMixin = {
    created() {
        if (this.$store.state.user.loginValid) {
            this.fetchData();
        } else {
            this.mixinFetchOnLoginUnsub = this.$store.subscribe(({ type, payload }) => {
                if (type === SET_LOGIN_VALID && payload === true) {
                    this.fetchData();
                }
            });
        }
    },
    beforeDestroy() {
        if (this.mixinFetchOnLoginUnsub) {
            this.mixinFetchOnLoginUnsub();
        }
    }
};

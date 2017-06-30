<template>
    <div>
        <mu-toast v-if="toast"
            :message="toastMsg"></mu-toast>
    </div>
</template>

<script>
export default {
    data() {
        return {
            toast: false,
            toastMsg: '',
            toastTimer: null
        };
    },
    methods: {
        showToast(msg, timeOut = 1500) {
            if (this.toast) {
                this.toast = false;
                clearTimeout(this.toastTimer);
            }
            this.toastMsg = String(msg);
            this.toastTimer = setTimeout(() => this.toast = false, timeOut);
            this.$nextTick(() => this.toast = true);
        },
    }
};
</script>

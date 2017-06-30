import Vue from 'vue';

const ToastConstructor = Vue.extend(require('./toast.vue').default);

export default {
    install($Vue) {
        const vm = new ToastConstructor().$mount();
        document.body.appendChild(vm.$el);
        $Vue.prototype.$toast = function (msg, timeOut = 1500) {
            console.log(vm);
            vm.showToast(msg, timeOut);
        };
    }
};

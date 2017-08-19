import Vue from 'vue';
import Toast from './toast.vue';

const ToastConstructor = Vue.extend(Toast);

export default {
    install($Vue) {
        const vm = new ToastConstructor().$mount();
        document.body.appendChild(vm.$el);
        $Vue.prototype.$toast = function (msg, timeOut = 1500) {
            vm.showToast(msg, timeOut);
        };
    }
};

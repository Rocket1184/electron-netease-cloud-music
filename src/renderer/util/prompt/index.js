import Vue from 'vue';
import Prompt from './prompt.vue';

const PromptConstructor = Vue.extend(Prompt);

export default {
    install($Vue) {
        const vm = new PromptConstructor().$mount();
        document.body.appendChild(vm.$el);
        $Vue.prototype.$prompt = function (cfg) {
            vm.showPrompt(cfg);
        };
    }
};

export default {
    /**
     * @param {Vue.VueConstructor} Vue
     */
    install(Vue) {
        const TouchRipple = Vue.component('mu-ripple');
        Vue.component('ncm-mu-dbclick-ripple', {
            extends: TouchRipple,
            render(h) {
                return h(this.tag, {
                    on: {
                        ...this.$listeners,
                        dblclick: (...arg) => {
                            if (this.$listeners.dblclick) {
                                this.$listeners.dblclick(...arg);
                            }
                            this.start(...arg);
                            setTimeout(() => this.end(...arg), 200);
                        }
                    }
                }, [h('div', {
                    class: this.rippleWrapperClass,
                    attrs: {
                        class: 'mu-ripple-wrapper'
                    },
                    ref: 'holder'
                }, this.createCircleRipple(h)), this.$slots.default]);
            }
        });
    }
};

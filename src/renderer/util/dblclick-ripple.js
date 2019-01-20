import TouchRipple from 'muse-ui/lib/internal/TouchRipple.js';

const DobuleClickRipple = Object.assign({}, TouchRipple);

DobuleClickRipple.render = function (h) {
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
};

export default {
    install(Vue) {
        Vue.component('ncm-mu-dbclick-ripple', DobuleClickRipple);
    }
};

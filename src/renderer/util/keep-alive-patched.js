export default {
    /**
     * @param {Vue.VueConstructor} Vue
     */
    install(Vue) {
        const KeepAlive = Vue.component('KeepAlive');
        Vue.component('keep-alive-patched', {
            extends: KeepAlive,
            updated() {
                const { _vnode, cache } = this;
                for (let key in cache) {
                    if (cache[key] && cache[key].parent && (cache[key].tag != _vnode.tag)) {
                        cache[key].parent = null;
                    }
                }
            }
        });
    }
};

import { platform } from 'os';
import Vue from 'vue';
import Vuex from 'vuex';

import * as modules from './modules';
import * as actions from './actions';
import * as getters from './getters';
import { installHooks } from './hooks';

Vue.use(Vuex);

const store = new Vuex.Store({
    modules,
    actions,
    getters,
    strict: process.env.NODE_ENV !== 'production'
});

installHooks(store);

if (platform() === 'linux') {
    require('@/util/mpris').injectStore(store);
}

require('@/util/tray').injectStore(store);

export default store;

// store hot reload
// @ts-ignore
if (process.env.NODE_ENV === 'development' && module.hot) {
    let { unsubscribeAll } = require('./hooks');
    // @ts-ignore
    module.hot.accept([
        './modules',
        './actions',
        './getters',
        './hooks'
    ], () => {
        unsubscribeAll();
        store.hotUpdate({
            modules: require('./modules'),
            actions: require('./actions'),
            getters: require('./getters')
        });
        const hooks = require('./hooks');
        hooks.installHooks(store);
        unsubscribeAll = hooks.unsubscribeAll;
    });
}

import Vue from 'vue';
import Vuex from 'vuex';

import * as modules from './modules/index';
import * as actions from './actions';
import * as getters from './getters';
import { installHooks } from './hooks';

Vue.use(Vuex);

/**
 * @typedef {import('./modules/index').State} State
 * @typedef {import('vuex').Store<State>} Store
 * @type {Store}
 */
const store = new Vuex.Store({
    modules,
    actions,
    getters,
    strict: process.env.NODE_ENV !== 'production'
});

installHooks(store);

export default store;

// store hot reload
/* eslint-disable */
if (process.env.NODE_ENV === 'development' && module.hot) {
    let { unsubscribeAll } = require('./hooks');
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
/* eslint-enable */

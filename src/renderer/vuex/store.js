import { platform } from 'os';
import Vue from 'vue';
import Vuex from 'vuex';

import * as modules from './modules';
import * as actions from './actions';
import * as getters from './getters';
import installHooks from './hooks';

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

export default store;

import { platform } from 'os';
import Vue from 'vue';
import Vuex from 'vuex';

import * as actions from './actions';
import * as getters from './getters';
import modules from './modules';

Vue.use(Vuex);

const store = new Vuex.Store({
    actions,
    getters,
    modules,
    strict: process.env.NODE_ENV !== 'production'
});

if (platform() === 'linux') {
    require('@/util/mpris').injectStore(store);
}

export default store;

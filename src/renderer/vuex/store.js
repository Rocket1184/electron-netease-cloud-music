import { platform } from 'os';
import Vue from 'vue';
import Vuex from 'vuex';

import * as actions from './actions';
import modules from './modules';

Vue.use(Vuex);

const store = new Vuex.Store({
    actions,
    modules,
    strict: process.env.NODE_ENV !== 'production'
});

if (platform() === 'linux') {
    require('@/util/mpris').injectStore(store);
}

export default store;

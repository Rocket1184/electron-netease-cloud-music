import * as types from '../mutation-types';

const state = {
    loginValid: false,
    cookie: {},
    loginType: null,
    account: null,
    profile: null,
    bindings: []
};

const mutations = {
    [types.UPDATE_USER_COOKIES](state, payload) {
        state.cookie = payload.cookie;
        state.loginValid = true;
    },
    [types.UPDATE_USER_INFO](state, payload) {
        state.loginType = payload.loginType;
        state.account = payload.account;
        state.profile = payload.profile;
        state.bindings = payload.bindings;
    }
};

export default {
    state,
    mutations
};

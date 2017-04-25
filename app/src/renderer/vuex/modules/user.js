import * as types from '../mutation-types';

const state = {
    loginValid: false,
    cookie: {},
    loginType: null,
    account: null,
    profile: null,
    bindings: [],
    playlist: []
};

const mutations = {
    [types.UPDATE_USER_COOKIES](state, payload) {
        state.cookie = payload.cookie;
    },
    [types.SET_LOGIN_VALID](state, payload) {
        state.loginValid = payload.valid === undefined ? true : payload.valid;
    },
    [types.UPDATE_USER_INFO](state, payload) {
        state.loginType = payload.loginType;
        state.account = payload.account;
        state.profile = payload.profile;
        state.bindings = payload.bindings;
        state.playlist = payload.playlist;
    }
};

export default {
    state,
    mutations
};

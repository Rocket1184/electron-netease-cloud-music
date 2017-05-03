import * as types from '../mutation-types';
import { User, PlayList } from '../../util/models';

const state = {
    loginValid: false,
    cookie: {},
    playlist: [],
    info: new User()
};

const mutations = {
    [types.UPDATE_USER_COOKIES](state, payload) {
        state.cookie = payload.cookie;
    },
    [types.SET_LOGIN_VALID](state, payload) {
        console.warn(types.SET_LOGIN_VALID, payload);
        if (payload === false || payload.valid === false) {
            state.loginValid = false;
        } else {
            state.loginValid = true;
        }
    },
    [types.SET_USER_INFO](state, payload) {
        state.info = new User(payload.info);
    },
    [types.UPDATE_USER_INFO](state, payload) {
        Object.assign(state.info, new User(payload.info));
    },
    [types.SET_USER_PLAYLIST](state, payload) {
        state.playlist = payload.playlist.map(l => new PlayList(l));
    }
};

export default {
    state,
    mutations
};

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
        if (payload === undefined || payload === true || payload.valid === true) {
            state.loginValid = true;
        } else {
            state.loginValid = false;
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
    },
    [types.UPDATE_USER_PLAYLIST](state, payload) {
        const target = state.playlist.filter(l => l.id === payload.id).pop();
        if (target) Object.assign(target, new PlayList(payload));
    }
};

export default {
    state,
    mutations
};

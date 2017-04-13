import * as types from '../mutation-types';

export const LOOP_TYPES = {
    LIST_LOOP: 0,
    SINGLE_LOOP: 1,
    RANDOM: 2
};

const state = {
    currentIndex: 0,
    loopMode: LOOP_TYPES.LIST_LOOP,
    list: []
};

const mutations = {
    [types.SET_PLAY_LIST](state, payload) {
        state.list = payload.list;
    },
    [types.CLEAR_PLAY_LIST](state) {
        state.list = [];
    },
    [types.SET_CURRENT_INDEX](state, payload) {
        state.currentIndex = payload.index;
    },
    [types.SET_LOOP_MODE_LOOP](state) {
        state.loopMode = LOOP_TYPES.LIST_LOOP;
    },
    [types.SET_LOOP_MODE_SINGLE](state) {
        state.loopMode = LOOP_TYPES.SINGLE_LOOP;
    },
    [types.SET_LOOP_MODE_RANDOM](state) {
        state.loopMode = LOOP_TYPES.RANDOM;
    },
    [types.RESTORE_PLAYLIST](state, payload) {
        state.currentIndex = payload.currentIndex;
        state.loopMode = payload.loopMode;
        state.list = payload.list;
    }
};

export default {
    state,
    mutations
};

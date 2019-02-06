import * as types from '../mutation-types';
import { LOOP_MODE } from './playlist';

const state = {
    list: [],
    index: 0,
    loopMode: LOOP_MODE.LIST
};

const mutations = {
    [types.RESTORE_RADIO](state, { list, index }) {
        state.list = list;
        state.index = index;
    },
    [types.APPEND_RADIO](state, { tracks }) {
        state.list.push.apply(state.list, tracks);
        if (state.list.length > 150) {
            state.list.splice(0, state.length - 150);
        }
    },
    [types.REMOVE_RADIO](state, { id }) {
        const i = state.list.findIndex(t => t.id === id);
        if (i >= 0) {
            if (i < state.index ||
                state.index === state.list.length - 1 && i === state.index) {
                state.index--;
            }
            state.list.splice(i, 1);
        }
    },
    [types.SET_RADIO_INDEX](state, payload) {
        state.index = payload;
    }
};

export default {
    state,
    mutations
};

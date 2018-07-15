import * as types from '../mutation-types';
import { Track } from '@/util/models';

export const LOOP_TYPES = {
    LIST_LOOP: 0,
    SINGLE_LOOP: 1,
    RANDOM: 2
};

const state = {
    index: 0,
    loopMode: LOOP_TYPES.LIST_LOOP,
    list: [],
};

const mutations = {
    [types.SET_PLAY_LIST](state, payload) {
        const { list } = payload;
        state.list = list.map(t => (t instanceof Track) ? t : new Track(t));
    },
    [types.CLEAR_PLAY_LIST](state) {
        state.list = [];
    },
    [types.SET_CURRENT_INDEX](state, payload) {
        if (typeof payload === 'number') {
            state.index = payload;
        } else if(typeof payload === 'object' && typeof payload.index === 'number') {
            state.index = payload.index;
        } else {
            throw new Error('Wrong mutation payload in SET_CURRENT_INDEX.');
        }
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
        const { index, loopMode, list } = payload;
        state.index = index || 0;
        state.loopMode = loopMode || LOOP_TYPES.LIST_LOOP;
        state.list = list.map(t => new Track(t));
    }
};

export default {
    state,
    mutations
};

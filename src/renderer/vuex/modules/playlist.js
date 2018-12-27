import * as types from '../mutation-types';
import { Track } from '@/util/models';

export const LOOP_MODE = {
    LIST: 0,
    SINGLE: 1,
    RANDOM: 2
};

const state = {
    index: 0,
    loopMode: LOOP_MODE.LIST,
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
        } else if (typeof payload === 'object' && typeof payload.index === 'number') {
            state.index = payload.index;
        } else {
            throw new Error('Wrong mutation payload in SET_CURRENT_INDEX.');
        }
    },
    [types.SET_LOOP_MODE_LIST](state) {
        state.loopMode = LOOP_MODE.LIST;
    },
    [types.SET_LOOP_MODE_SINGLE](state) {
        state.loopMode = LOOP_MODE.SINGLE;
    },
    [types.SET_LOOP_MODE_RANDOM](state) {
        state.loopMode = LOOP_MODE.RANDOM;
    },
    [types.RESTORE_PLAYLIST](state, payload) {
        const { index, loopMode, list } = payload;
        state.index = index || 0;
        state.loopMode = loopMode || LOOP_MODE.LIST;
        state.list = list.map(t => new Track(t));
    },
    [types.ADD_TRACK_TO_PLAYLIST](state, payload) {
        const { tracks } = payload;
        state.list.splice(state.index + 1, 0, ...tracks);
    }
};

export default {
    state,
    mutations
};

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
    /** @type {Models.Track[]} */
    list: [],
};

/**
 * @typedef {typeof state} State
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
    [types.SET_PLAY_LIST](state, payload) {
        state.list = payload;
    },
    [types.CLEAR_PLAY_LIST](state) {
        state.list = [];
    },
    [types.SET_CURRENT_INDEX](state, payload) {
        if (typeof payload === 'number') {
            state.index = payload;
            return;
        }
        throw new Error('Wrong mutation payload in SET_CURRENT_INDEX.');
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
    [types.RESTORE_PLAYLIST](state, { index, loopMode, list }) {
        state.index = index || 0;
        state.loopMode = loopMode || LOOP_MODE.LIST;
        state.list = list.map(t => new Track(t));
    },
    [types.INSERT_TRACK_INTO_PLAYLIST](state, { tracks, index }) {
        state.list.splice(index, 0, ...tracks);
        if (index <= state.index) {
            // keep current track unchanged
            state.index += tracks.length;
        }
    },
    [types.REMOVE_TRACK_FROM_PLAYLIST](state, { start, count }) {
        state.list.splice(start, count);
        const end = start + count - 1;
        if (start > state.index) return;
        if (end < state.index) {
            state.index -= count;
            return;
        }
        // start <= index && end >= index
        if (start < state.list.length) {
            state.index = start;
        } else {
            state.index = state.list.length - 1;
        }
    }
};

export default {
    state,
    mutations
};

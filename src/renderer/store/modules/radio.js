import * as types from '../mutation-types';
import { LOOP_MODE } from './playlist';

const state = {
    /** @type {Models.Track[]} */
    list: [],
    index: 0,
    loopMode: LOOP_MODE.LIST
};

const trackIdMap = new Map();

/**
 * @typedef {typeof state} State
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
    [types.RESTORE_RADIO](state, /** @type {{ list: Models.Track[], index: number }} */ { list, index }) {
        state.index = index;
        list.forEach(t => {
            if (!trackIdMap.has(t.id)) {
                trackIdMap.set(t.id, true);
                state.list.push(t);
            }
        });
    },
    [types.CLEAR_RADIO](state) {
        state.list = [];
        state.index = 0;
    },
    [types.APPEND_RADIO](state, /** @type {{ tracks: Models.Track[] }} */ { tracks }) {
        const toAppend = [];
        tracks.forEach(t => {
            if (!trackIdMap.has(t.id)) {
                trackIdMap.set(t.id, true);
                toAppend.push(t);
            }
        });
        const MaxLength = 150;
        state.list.push.apply(state.list, toAppend);
        if (state.list.length > MaxLength) {
            const removeCount = state.list.length - MaxLength;
            state.list.splice(0, removeCount);
            state.index -= removeCount;
        }
    },
    [types.REMOVE_RADIO](state, /** @type {{ id: number }} */ { id }) {
        const i = state.list.findIndex(t => t.id === id);
        if (i >= 0) {
            if (i < state.index ||
                state.index === state.list.length - 1 && i === state.index) {
                state.index--;
            }
            state.list.splice(i, 1);
            trackIdMap.delete(id);
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

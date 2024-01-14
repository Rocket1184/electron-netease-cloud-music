// @ts-check

import * as types from '../mutation-types';
import { LOOP_MODE } from './playlist';

const state = {
    /** @type {Models.Track[]} */
    list: [],
    index: 0,
    loopMode: LOOP_MODE.LIST
};

const RADIO_MAX_SIZE = 150;

const trackIdSet = new Set();

/**
 * @typedef {typeof state} State
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
    [types.RESTORE_RADIO](state, /** @type {{ list: Models.Track[], index: number }} */ { list, index }) {
        state.index = index;
        state.list = list;
        for (const t of list) {
            trackIdSet.add(t.id);
        }
    },
    [types.CLEAR_RADIO](state) {
        state.list = [];
        state.index = 0;
        trackIdSet.clear();
    },
    [types.APPEND_RADIO](state, /** @type {{ tracks: Models.Track[] }} */ { tracks }) {
        if (tracks.length === 0) {
            tracks.push(state.list[0]);
        }
        for (const t of tracks) {
            if (trackIdSet.has(t.id)) {
                const duplicate = state.list.findIndex(s => s.id === t.id);
                state.list.splice(duplicate, 1);
                if (duplicate < state.index) state.index--;
            } else {
                trackIdSet.add(t.id);
            }
        }
        state.list.push.apply(state.list, tracks);
        if (state.list.length > RADIO_MAX_SIZE) {
            const removeCount = state.list.length - RADIO_MAX_SIZE;
            const removed = state.list.splice(0, removeCount);
            for (const r of removed) {
                trackIdSet.delete(r.id);
            }
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
            trackIdSet.delete(id);
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

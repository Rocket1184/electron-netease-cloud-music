// @ts-check

import range from 'lodash/range';
import shuffle from 'lodash/shuffle';

import * as types from '../mutation-types';

export const LOOP_MODE = {
    LIST: 0,
    SINGLE: 1,
    RANDOM: 2,
    LOOP: 3,
};

const state = {
    index: 0,
    loopMode: LOOP_MODE.LIST,
    /** @type {Models.Track[]} */
    list: [],
    /** @type {number[]} */
    randomList: [],
    randomIndex: 0
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
        state.index = 0;
        state.list = [];
        state.randomIndex = 0;
        state.randomList = [];
    },
    [types.SET_PLAYLIST_INDEX](state, payload) {
        state.index = payload;
    },
    [types.SET_LOOP_MODE_LOOP](state) {
        state.loopMode = LOOP_MODE.LOOP;
    },
    [types.SET_LOOP_MODE_SINGLE](state) {
        state.loopMode = LOOP_MODE.SINGLE;
    },
    [types.SET_LOOP_MODE_RANDOM](state) {
        state.loopMode = LOOP_MODE.RANDOM;
    },
    [types.SET_LOOP_MODE_LIST](state) {
        state.loopMode = LOOP_MODE.LIST;
    },
    [types.RESTORE_PLAYLIST](state, { index, loopMode, list }) {
        state.index = index || 0;
        state.loopMode = loopMode || LOOP_MODE.LIST;
        state.list = list;
    },
    [types.INSERT_TRACK_INTO_PLAYLIST](state, /** @type {{ start: number, tracks: Models.Track[] }} */ { start, tracks }) {
        state.list.splice(start, 0, ...tracks);
        if (start <= state.index) {
            // keep current track unchanged
            state.index += tracks.length;
        }
    },
    [types.REMOVE_TRACK_FROM_PLAYLIST](state, /** @type {{ start: number, count: number }} */ { start, count }) {
        const { index, list } = state;
        const removed = list.splice(start, count).length;
        if (index < start) {
            // nothing
        } else if (index >= start + removed) {
            state.index -= removed;
        } else {
            state.index = (start < list.length) ? start : list.length - 1;
        }
    },
    [types.GENERATE_RANDOM_PLAYLIST](state, /** @type {number} */ payload = 0) {
        const arr = shuffle(range(state.list.length));
        state.randomIndex = arr.findIndex(v => v === payload);
        state.randomList = arr;
    },
    [types.SET_RANDOM_PLAYLIST_INDEX](state, /** @type {number} */ payload) {
        state.randomIndex = payload;
    },
    // eslint-disable-next-line no-unused-vars
    [types.INSERT_TRACK_INTO_RANDOM_PLAYLIST](state, /** @type {{ start: number, count: number }} */ { start, count }) {
        const { index, randomIndex, randomList } = state;
        // queued track(s) should be played right after current track.
        // so it's index in playlist (`index + 1`) should be instered in `randomList` after `randomIndex`
        const insertPosition = randomIndex;
        const seq = range(index + 1, index + 1 + count);
        randomList.splice(insertPosition + 1, 0, ...seq);
        const total = randomList.length;
        for (let i = 0; i < total; i++) {
            if (randomList[i] >= seq[0]) {
                if (i <= insertPosition || insertPosition + count < i) {
                    randomList[i] += count;
                }
            }
        }
    },
    [types.REMOVE_TRACK_FROM_RANDOM_PLAYLIST](state, /** @type {{ start: number, count: number }} */ { start, count }) {
        const { randomIndex, randomList } = state;
        const kept = [];
        const removed2 = [];
        let offset = 0;
        const total = randomList.length;
        for (let i = 0; i < total; i++) {
            const r = randomList[i];
            // filter out tracks in "removed" range
            if (r < start || start + count <= r) {
                kept.push(r);
            } else {
                // for each track removed before randomIndex,
                // it shoud decrease by 1
                if (i < randomIndex) offset++;
                removed2.push(r);
            }
        }
        for (let i = 0; i < kept.length; i++) {
            const k = kept[i];
            // every kept value shoud decrease by count of removed values that less than it
            kept[i] -= removed2.filter(r => r < k).length;
        }
        state.randomList = kept;
        state.randomIndex = randomIndex - offset;
    }
};

export default {
    state,
    mutations
};

import * as types from '../mutation-types';

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
    /** @type {[number]} */
    randomHeardList: [],
    randomHeardListPointer: 0,
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
        state.index = payload;
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
    [types.GENERATE_RANDOM_HEARD_LIST](state, payload) {
        state.randomHeardList = Array(payload).fill(1).map((v, i) => i);
        for (let i = state.randomHeardList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [state.randomHeardList[i], state.randomHeardList[j]] = [state.randomHeardList[j], state.randomHeardList[i]];
        }//生成一个0-(length-1)的乱序不重复随机数组
        state.randomHeardListPointer = 0;//初始化指针
    },
    [types.SET_RANDOMLIST_POINTER](state, payload) {
        state.randomHeardListPointer = payload;
    },
    [types.INSERT_TRACK_INTO_RANDOM_PLAYLIST](state, { index, offset }) {
        state.randomHeardList.splice(state.randomHeardListPointer + offset, 0, index)
        for (let i = 0; i < state.randomHeardList.length; i++)
            if (state.randomHeardList[i] >= index)
                if (i != state.randomHeardListPointer + offset)
                    state.randomHeardList[i]++;
    },
    [types.RESTORE_PLAYLIST](state, { index, loopMode, list }) {
        state.index = index || 0;
        state.loopMode = loopMode || LOOP_MODE.LIST;
        state.list = list;
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

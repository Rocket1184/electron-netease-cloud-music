import * as types from '../mutation-types';
import { Track } from '@/util/models';

export const LOOP_TYPES = {
    LIST_LOOP: 0,
    SINGLE_LOOP: 1,
    RANDOM: 2
};

const state = {
    paused: true,
    currentIndex: 0,
    loopMode: LOOP_TYPES.LIST_LOOP,
    list: [new Track()],
    activeLyric: {}
};

const mutations = {
    [types.UPDATE_PLAYING_URL](state, payload) {
        const { list, currentIndex } = state;
        let target = list[currentIndex];
        if (payload) Object.assign(target.urls, payload);
    },
    [types.PAUSE_PLAYING_MUSIC](state) {
        state.paused = true;
    },
    [types.RESUME_PLAYING_MUSIC](state) {
        state.paused = false;
    },
    [types.SET_PLAY_LIST](state, payload) {
        const { list } = payload;
        state.list = list.map(t => (t instanceof Track) ? t : new Track(t));
    },
    [types.CLEAR_PLAY_LIST](state) {
        state.list = [new Track()];
    },
    [types.SET_CURRENT_INDEX](state, payload) {
        if (typeof payload === 'number') {
            state.currentIndex = payload;
        } else if(typeof payload === 'object' && typeof payload.index === 'number') {
            state.currentIndex = payload.index;
        } else {
            throw new Error('Wrong mutation payload in SET_CURRENT_INDEX.');
        }
    },
    [types.SET_ACTIVE_LYRIC](state, payload) {
        state.activeLyric = payload;
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
        const { currentIndex, loopMode, list, paused, activeLyric } = payload;
        state.paused = paused || true;
        state.currentIndex = currentIndex || 0;
        state.loopMode = loopMode || LOOP_TYPES.LIST_LOOP;
        state.list = list.map(t => new Track(t));
        state.activeLyric = activeLyric || {};
    }
};

export default {
    state,
    mutations
};

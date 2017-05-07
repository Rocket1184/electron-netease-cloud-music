import * as types from '../mutation-types';
import { Track } from '../../util/models';

export const LOOP_TYPES = {
    LIST_LOOP: 0,
    SINGLE_LOOP: 1,
    RANDOM: 2
};

export const QUALITY_LEVELS = {
    HIGH: 'h',
    MEDIUM: 'm',
    LOW: 'l'
};

const state = {
    quality: QUALITY_LEVELS.HIGH,
    paused: true,
    currentIndex: 0,
    loopMode: LOOP_TYPES.LIST_LOOP,
    list: [new Track()],
};

const mutations = {
    [types.UPDATE_PLAYING_MUSIC](state, payload) {
        const { list, currentIndex } = state;
        const { urls, lyrics } = payload;
        let target = list[currentIndex];
        if (urls) Object.assign(target.urls, urls);
        if (lyrics) target.lyrics = lyrics;
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
        const { quality, currentIndex, loopMode, list } = payload;
        state.paused = true;
        state.quality = quality || QUALITY_LEVELS.HIGH;
        state.currentIndex = currentIndex || 0;
        state.loopMode = loopMode || LOOP_TYPES.LIST_LOOP;
        state.list = list.map(t => new Track(t));
    }
};

export default {
    state,
    mutations
};

import * as types from '../mutation-types';

const state = {
    audioSrc: '',
    paused: true,
    lyric: {},
    lyricSeq: 0,
    collectPopupShow: false,
    collectTrackIds: []
};

const mutations = {
    [types.PAUSE_PLAYING_MUSIC](state) {
        state.paused = true;
    },
    [types.RESUME_PLAYING_MUSIC](state) {
        state.paused = false;
    },
    [types.UPDATE_PLAYING_URL](state, payload) {
        state.audioSrc = payload;
    },
    [types.SET_ACTIVE_LYRIC](state, payload) {
        state.lyric = payload;
        state.lyricSeq = state.lyricSeq + 1;
    },
    [types.SHOW_COLLECT_POPUP](state) {
        state.collectPopupShow = true;
    },
    [types.HIDE_COLLECT_POPUP](state) {
        state.collectPopupShow = false;
    },
    [types.SET_COLLECT_TRACKS](state, payload) {
        state.collectTrackIds = payload.ids;
    }
};

export default {
    state,
    mutations
};

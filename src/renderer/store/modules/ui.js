import * as types from '../mutation-types';

const state = {
    audioSrc: '',
    audioVolume: 100,
    audioMute: false,
    coverImgSrc: '',
    paused: true,
    lyricLoading: false,
    /** @type {Partial<Types.MusicLyricRes>} */
    lyric: {},
    search: {
        pending: false,
        keyword: '',
        type: '',
        offset: 0,
        result: {
            total: 0,
            /** @type {?(Models.Album|Models.Artist|Models.PlayList|Models.Track|Models.User|Models.Video)[]} */
            items: null
        },
        /** @type {?{code: number, msg?: string}} */
        error: null
    },
    collectPopupShow: false,
    /** @type {number[]} */
    collectTrackIds: [],
    radioMode: false
};

/**
 * @typedef {typeof state} State
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
    [types.RESTORE_UI_STATE](state, payload) {
        Object.entries(payload).forEach(([key, val]) => state[key] = val);
    },
    [types.SET_AUDIO_PAUSED](state, /** @type {boolean} */ payload) {
        state.paused = payload;
    },
    [types.UPDATE_PLAYING_URL](state, /** @type {string} */ payload) {
        state.audioSrc = payload;
    },
    [types.SET_AUDIO_VOLUME](state, { mute, volume }) {
        if (typeof mute === 'boolean') state.audioMute = mute;
        if (typeof volume === 'number') state.audioVolume = volume;
    },
    [types.SET_COVER_IMG_SRC](state, payload) {
        state.coverImgSrc = payload;
    },
    [types.SET_LYRIC_LOADING](state, payload) {
        if (payload === true) {
            state.lyricLoading = true;
        } else {
            state.lyricLoading = false;
        }
    },
    [types.SET_ACTIVE_LYRIC](state, /** @type {Types.MusicLyricRes} */ payload) {
        state.lyric = payload;
    },
    [types.SET_SEARCH_PARAM](state, { keyword, type, offset }) {
        state.search.keyword = keyword;
        state.search.type = type;
        state.search.offset = offset;
    },
    [types.SET_SEARCH_PENDING](state, payload) {
        state.search.pending = payload;
    },
    [types.SET_SEARCH_RESULT](state, payload) {
        state.search.error = null;
        state.search.result = payload;
    },
    [types.SET_SEARCH_ERROR](state, payload) {
        state.search.error = payload;
        state.search.result = { total: 0, items: null };
    },
    [types.SHOW_COLLECT_POPUP](state) {
        state.collectPopupShow = true;
    },
    [types.HIDE_COLLECT_POPUP](state) {
        state.collectPopupShow = false;
    },
    [types.SET_COLLECT_TRACKS](state, /** @type {number[]} */ payload) {
        state.collectTrackIds = payload;
    },
    [types.ACTIVATE_RADIO](state, /** @type {boolean} */ payload) {
        state.radioMode = payload;
    }
};

export default {
    state,
    mutations
};

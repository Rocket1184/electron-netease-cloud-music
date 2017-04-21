import * as types from '../mutation-types';

const BlankState = {
    id: null,
    name: null,
    br: null,
    playing: false,
    size: null,
    md5: null,
    url: null,
    album: {
        id: null,
        name: null,
        picId: null,
        picUrl: null
    },
    artists: [
        {
            alias: [],
            id: null,
            name: null,
            tns: []
        }
    ],
    lyrics: {}
};

let state = BlankState;

const mutations = {
    [types.SET_PLAYING_MUSIC](state, payload) {
        for (let key in payload) {
            if (key !== 'type') state[key] = payload[key];
        }
    },
    [types.CLEAR_PLAYING_MUSIC](state) {
        state = BlankState;
    },
    [types.PAUSE_PLAYING_MUSIC](state) {
        state.playing = false;
    },
    [types.RESUME_PLAYING_MUSIC](state) {
        state.playing = true;
    }
};

export default {
    state,
    mutations
};

import * as types from '../mutation-types';
import { Track } from '@/util/models';

const state = {
    timestamp: -1,
    songs: [],
    statistics: {
        playCnt: '...',
        likeCnt: '...',
        followCnt: '...'
    }
};

/**
 * @typedef {typeof state} State
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
    [types.SET_RECOMMEND_SONGS](state, /** @type {Models.Track[]} */ payload) {
        state.timestamp = Date.now();
        state.songs = payload.map(t => new Track(t));
    },
    [types.SET_RECOMMEND_STATISTICS](state, /** @type {typeof state.statistics} */ payload) {
        state.statistics = payload;
    },
    [types.REPLACE_RECOMMEND_SONG](state, /** @type {{ id: number, track: Models.Track }} */ { id, track }) {
        const i = state.songs.findIndex(t => t.id === id);
        if (i >= 0) {
            state.songs.splice(i, 1, new Track(track));
        }
    }
};

export default {
    state,
    mutations
};

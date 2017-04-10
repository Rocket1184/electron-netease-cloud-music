import * as types from './mutation-types';
import { LOOP_TYPES } from './modules/playlist';
import ApiRenderer from '../util/apirenderer';

export const decrementMain = ({ commit }) => {
    commit(types.DECREMENT_MAIN_COUNTER);
};

export const incrementMain = ({ commit }) => {
    commit(types.INCREMENT_MAIN_COUNTER);
};

async function playThisTrack(commit, list, index) {
    const oUrl = await ApiRenderer.getMusicUrl(list[index].id);
    commit({
        ...list[index],
        ...oUrl.data[0],
        type: types.SET_PLAYING_MUSIC,
    });
    commit({
        type: types.RESUME_PLAYING_MUSIC
    });
    commit({
        type: types.SET_CURRENT_INDEX,
        index
    });
}

export const nextTrack = ({ commit, state }) => {
    const { currentIndex, list } = state.playlist;
    let nextIndex = (currentIndex + 1) % list.length;
    playThisTrack(commit, state.playlist.list, nextIndex);
};

export const previousTrack = ({ commit, state }) => {
    const { currentIndex, list } = state.playlist;
    let nextIndex = (currentIndex + list.length - 1) % list.length;
    playThisTrack(commit, state.playlist.list, nextIndex);
};

export const playPlaylist = async ({ commit, state }, payload) => {
    if (payload) {
        await commit({
            type: types.SET_PLAY_LIST,
            list: payload.list
        });
    }
    const { list, loopMode } = state.playlist;
    let firstIndex = loopMode === LOOP_TYPES.RANDOM
        ? parseInt(Math.random() * 100000) % list.length
        : 0;
    playThisTrack(commit, state.playlist.list, firstIndex);
};

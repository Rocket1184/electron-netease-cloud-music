import * as types from './mutation-types';
import { LOOP_TYPES } from './modules/playlist';
import ApiRenderer from '../util/apirenderer';

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

export const refreshCurrentTrack = async ({ state, commit }) => {
    const oUrl = await ApiRenderer.getMusicUrl(state.playing.id);
    commit({
        ...oUrl.data[0],
        type: types.SET_PLAYING_MUSIC,
    });
};

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

export const playTrackIndex = ({ commit, state }, payload) => {
    playThisTrack(commit, state.playlist.list, payload.index);
};

export const restorePlaylist = async ({ commit, state }, payload) => {
    const { playing, playlist } = payload;
    commit({
        type: types.RESTORE_PLAYLIST,
        ...playlist
    });
    const oUrl = await ApiRenderer.getMusicUrl(playing.id);
    commit({
        ...playing,
        ...oUrl.data[0],
        type: types.SET_PLAYING_MUSIC,
    });
};

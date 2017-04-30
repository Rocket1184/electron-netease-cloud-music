import * as types from './mutation-types';
import { LOOP_TYPES } from './modules/playlist';
import ApiRenderer from '../util/apirenderer';

export const setUserInfo = async ({ state, commit }, payload) => {
    const { info, cookie } = payload;
    commit({
        type: types.UPDATE_USER_COOKIES,
        cookie
    });
    commit({
        type: types.UPDATE_USER_INFO,
        info
    });
    commit(types.SET_LOGIN_VALID);
};

async function playThisTrack(commit, list, index, quality) {
    const [oUrl, lyrics] = await Promise.all([
        ApiRenderer.getMusicUrl(list[index].id, quality),
        ApiRenderer.getMusicLyric(list[index].id)
    ]);
    // those invoke can't be reversed!
    // from below
    commit({
        type: types.SET_CURRENT_INDEX,
        index
    });
    commit({
        type: types.UPDATE_PLAYING_MUSIC,
        urls: { [quality]: oUrl.data[0].url },
        lyrics
    });
    // to above
    commit(types.RESUME_PLAYING_MUSIC);
}

export const refreshCurrentTrack = async ({ state, commit }) => {
    const oUrl = await ApiRenderer.getMusicUrl(state.playing.id);
    commit({
        ...oUrl.data[0],
        type: types.SET_PLAYING_MUSIC,
    });
};

export const playNextTrack = ({ commit, state }) => {
    const { currentIndex, list, quality } = state.playlist;
    let nextIndex = (currentIndex + 1) % list.length;
    playThisTrack(commit, list, nextIndex, quality);
};

export const playPreviousTrack = ({ commit, state }) => {
    const { currentIndex, list, quality } = state.playlist;
    let nextIndex = (currentIndex + list.length - 1) % list.length;
    playThisTrack(commit, list, nextIndex, quality);
};

export const playPlaylist = async ({ commit, state }, payload) => {
    if (payload) {
        commit({
            type: types.SET_PLAY_LIST,
            list: payload.list
        });
    }
    const { list, loopMode, quality } = state.playlist;
    let firstIndex = loopMode === LOOP_TYPES.RANDOM
        ? parseInt(Math.random() * 100000) % list.length
        : 0;
    playThisTrack(commit, list, firstIndex, quality);
};

export const playTrackIndex = ({ commit, state }, payload) => {
    const { list, quality } = state.playlist;
    playThisTrack(commit, list, payload.index, quality);
};

export const restorePlaylist = async ({ commit, state }, payload) => {
    const { playlist } = payload;
    commit({
        type: types.RESTORE_PLAYLIST,
        ...playlist
    });
    const oldUrl = playlist.list[playlist.currentIndex].urls[playlist.quality];
    const status = await ApiRenderer.checkUrlStatus(oldUrl);
    if (status !== 200) {
        const oUrl = await ApiRenderer.getMusicUrl(playlist.list[playlist.currentIndex].id);
        commit({
            type: types.UPDATE_PLAYING_MUSIC,
            urls: { [playlist.quality]: oUrl.data[0].url }
        });
    }
};

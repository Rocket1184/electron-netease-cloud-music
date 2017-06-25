import * as types from './mutation-types';
import { LOOP_TYPES } from './modules/playlist';
import ApiRenderer from '../util/apiRenderer';

export function setUserInfo({ commit }, payload) {
    const { info, cookie } = payload;
    commit({
        type: types.UPDATE_USER_COOKIES,
        cookie
    });
    commit({
        type: types.SET_USER_INFO,
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

export async function refreshCurrentTrack({ state, commit }) {
    const quality = state.settings.bitRate;
    const { currentIndex, list } = state.playlist;
    const oUrl = await ApiRenderer.getMusicUrl(list[currentIndex].id, quality);
    commit({
        type: types.UPDATE_PLAYING_MUSIC,
        urls: { [quality]: oUrl.data[0].url },
    });
};

export function playNextTrack({ commit, state }) {
    const quality = state.settings.bitRate;
    const { currentIndex, list } = state.playlist;
    let nextIndex = (currentIndex + 1) % list.length;
    playThisTrack(commit, list, nextIndex, quality);
};

export function playPreviousTrack({ commit, state }) {
    const quality = state.settings.bitRate;
    const { currentIndex, list } = state.playlist;
    let nextIndex = (currentIndex + list.length - 1) % list.length;
    playThisTrack(commit, list, nextIndex, quality);
};

export async function playPlaylist({ commit, state }, payload) {
    if (payload) {
        commit({
            type: types.SET_PLAY_LIST,
            list: payload.list
        });
    }
    const quality = state.settings.bitRate;
    const { list, loopMode } = state.playlist;
    let firstIndex = loopMode === LOOP_TYPES.RANDOM
        ? parseInt(Math.random() * 100000) % list.length
        : 0;
    playThisTrack(commit, list, firstIndex, quality);
};

export function playTrackIndex({ commit, state }, payload) {
    const quality = state.settings.bitRate;
    const { list } = state.playlist;
    playThisTrack(commit, list, payload.index, quality);
};

export async function restorePlaylist({ commit }, payload) {
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

export async function refreshUserPlaylist({ commit }, payload) {
    const resp = await ApiRenderer.getListDetail(payload);
    commit(types.UPDATE_USER_PLAYLIST, resp.playlist);
};

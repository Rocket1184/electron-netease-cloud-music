import * as types from './mutation-types';
import { LOOP_TYPES } from './modules/playlist';
import ApiRenderer from '../util/apiRenderer';

export function setUserInfo({ commit }, payload) {
    commit(types.SET_USER_INFO, payload);
};

export function storeUserInfo(context, payload) {
    const { user, cookie } = payload;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('cookie', JSON.stringify(cookie));
}

export async function restoreUserInfo(context) {
    const user = localStorage.getItem('user');
    const cookie = localStorage.getItem('cookie');
    if (user && cookie) {
        const userObj = JSON.parse(user);
        const cookieObj = JSON.parse(cookie);
        context.commit(types.SET_USER_INFO, { info: userObj });
        ApiRenderer.updateCookie(cookieObj);
        const resp = await ApiRenderer.refreshLogin();
        if (resp.code === 200) {
            setLoginValid(context);
            return true;
        } else {
            ApiRenderer.updateCookie({});
            return false;
        }
    }
}

export function setLoginValid({ state, commit }, payload) {
    if (payload === undefined || payload === true || payload.valid === true) {
        commit(types.SET_LOGIN_VALID);
        const { id } = state.user.info;
        ApiRenderer.getCookie()
            .then(cookie => localStorage.setItem('cookie', JSON.stringify(cookie)));
        ApiRenderer.getUserPlaylist(id).then(resp => {
            commit(types.UPDATE_USER_INFO, {
                info: resp.playlist[0].creator
            });
            commit(types.SET_USER_PLAYLIST, {
                playlist: resp.playlist
            });
            if (~resp.playlist[0].name.indexOf('喜欢的音乐')) {
                return resp.playlist[0].id;
            }
        }).then(likedListId => {
            ApiRenderer.getListDetail(likedListId).then(list => {
                commit(types.UPDATE_USER_PLAYLIST, list.playlist);
            });
        });
    } else {
        commit(types.SET_LOGIN_VALID, false);
    }
}

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

import * as types from './mutation-types';
import { LOOP_TYPES } from './modules/playlist';
import ApiRenderer from '@/util/apiRenderer';
import { User } from '@/util/models';

export async function restoreSettings({ commit }) {
    const st = await ApiRenderer.getCurrentSettings();
    commit(types.UPDATE_SETTINGS, st);
}

export function setUserInfo({ commit }, payload) {
    commit(types.SET_USER_INFO, payload);
}

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
        context.commit(types.SET_USER_INFO, userObj);
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
        ApiRenderer.getCookie().then(cookie => {
            localStorage.setItem('cookie', JSON.stringify(cookie));
        });
        ApiRenderer.getUserPlaylist(state.user.info.id).then(({ playlist }) => {
            commit(types.UPDATE_USER_INFO, playlist[0].creator);
            commit(types.SET_USER_PLAYLISTS, playlist);
            if (~playlist[0].name.indexOf('喜欢的音乐')) {
                return playlist[0].id;
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

export function logout({ commit }) {
    ApiRenderer.logout().then(code => {
        if (code == 200) {
            commit(types.SET_LOGIN_VALID, false);
            setUserInfo({ commit }, new User());
            ['user', 'cookie'].map(k => localStorage.removeItem(k));
        }
    });
}

async function updateUiUrl(commit, trackId, quality) {
    const oUrl = await ApiRenderer.getMusicUrlCached(trackId, quality);
    commit(types.UPDATE_PLAYING_URL, oUrl.url);
}

async function updateUiLyric(commit, id) {
    const lyric = await ApiRenderer.getMusicLyricCached(id);
    commit(types.SET_ACTIVE_LYRIC, lyric);
}

async function playThisTrack(commit, list, index, quality) {
    commit(types.SET_CURRENT_INDEX, index);
    commit(types.SET_ACTIVE_LYRIC, {});
    const id = list[index].id;
    updateUiLyric(commit, id);
    await updateUiUrl(commit, id, quality);
    commit(types.RESUME_PLAYING_MUSIC);
}

export function playNextTrack({ commit, state }) {
    const quality = state.settings.bitRate;
    const { index, list } = state.playlist;
    let nextIndex = (index + 1) % list.length;
    playThisTrack(commit, list, nextIndex, quality);
}

export function playPreviousTrack({ commit, state }) {
    const quality = state.settings.bitRate;
    const { index, list } = state.playlist;
    let nextIndex = (index + list.length - 1) % list.length;
    playThisTrack(commit, list, nextIndex, quality);
}

export async function playPlaylist({ commit, state }, payload) {
    if (payload) {
        commit(types.SET_PLAY_LIST, { list: payload.list });
    }
    const quality = state.settings.bitRate;
    const { list, loopMode } = state.playlist;
    let firstIndex = loopMode === LOOP_TYPES.RANDOM
        ? Math.floor(Math.random() * 100000) % list.length
        : 0;
    playThisTrack(commit, list, firstIndex, quality);
}

export function playTrackIndex({ commit, state }, payload) {
    const quality = state.settings.bitRate;
    const { list } = state.playlist;
    playThisTrack(commit, list, payload.index, quality);
}

export async function restorePlaylist({ commit, state }, payload) {
    const { playlist } = payload;
    commit(types.RESTORE_PLAYLIST, playlist);
    const id = playlist.list[playlist.index].id;
    updateUiUrl(commit, id, state.settings.bitRate);
    updateUiLyric(commit, id);
}

export async function refreshUserPlaylist({ commit }, payload) {
    const resp = await ApiRenderer.getListDetail(payload);
    commit(types.UPDATE_USER_PLAYLIST, resp.playlist);
}

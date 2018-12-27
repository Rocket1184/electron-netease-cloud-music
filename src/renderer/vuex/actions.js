import * as types from './mutation-types';
import { LOOP_MODE } from './modules/playlist';
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

export async function updateUserPlaylists({ state, commit }) {
    const { playlist } = await ApiRenderer.getUserPlaylist(state.user.info.id);
        commit(types.UPDATE_USER_INFO, playlist[0].creator);
        commit(types.SET_USER_PLAYLISTS, playlist);
        return playlist;
}

export function setLoginValid(context, payload) {
    if (payload === undefined || payload === true || payload.valid === true) {
        context.commit(types.SET_LOGIN_VALID);
        ApiRenderer.getCookie().then(cookie => {
            localStorage.setItem('cookie', JSON.stringify(cookie));
        });
        updateUserPlaylists(context).then(playlist => {
            if (playlist[0].name.endsWith('喜欢的音乐')) {
                ApiRenderer.getListDetail(playlist[0].id).then(list => {
                    context.commit(types.UPDATE_USER_PLAYLIST, list.playlist);
                });
            }
        });
    } else {
        context.commit(types.SET_LOGIN_VALID, false);
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

export async function updateUiUrlNoCache({ commit, state }) {
    const { index, list } = state.playlist;
    const quality = state.settings.bitRate;
    const oUrl = await ApiRenderer.getMusicUrlNoCache(list[index].id, quality);
    commit(types.UPDATE_PLAYING_URL, oUrl.url + '?' + Date.now());
}

export function playAudio({ commit }) {
    commit(types.RESUME_PLAYING_MUSIC);
}

export function pauseAudio({ commit }) {
    commit(types.PAUSE_PLAYING_MUSIC);
}

async function playThisTrack(commit, list, index, quality) {
    commit(types.SET_CURRENT_INDEX, index);
    commit(types.SET_ACTIVE_LYRIC, {});
    const track = list[index];
    updateUiLyric(commit, track.id);
    await updateUiUrl(commit, track.id, quality);
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

export function storePlaylist({ commit, state }) {
    if (!state.settings.autoPlay) {
        commit(types.PAUSE_PLAYING_MUSIC);
    }
    localStorage.setItem('playlist', JSON.stringify(state.playlist));
}

export function restorePlaylist({ commit, state }) {
    try {
        const stored = localStorage.getItem('playlist');
        if (stored) {
            const playlist = JSON.parse(stored);
            commit(types.RESTORE_PLAYLIST, playlist);
            const track = playlist.list[playlist.index];
            updateUiUrl(commit, track.id, state.settings.bitRate);
            updateUiLyric(commit, track.id);
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.info('Playlist stored in localStorage not valid.');
    }
}

export async function updatePlaylistDetail({ commit }, payload) {
    const listId = typeof payload === 'number' ? payload : payload.id;
    const resp = await ApiRenderer.getListDetail(listId);
    commit(types.UPDATE_USER_PLAYLIST, resp.playlist);
}

export function toggleCollectPopup({ commit, state }, payload = {}) {
    const tracks = typeof payload === 'number'
        ? { ids: [payload] }
        : Array.isArray(payload)
            ? { ids: payload }
            : Array.isArray(payload.ids)
                ? { ids: payload.ids }
                : { ids: [] };
    commit(types.SET_COLLECT_TRACKS, tracks);
    if (state.ui.collectPopupShow === true) {
        commit(types.HIDE_COLLECT_POPUP);
        return;
    }
    commit(types.SHOW_COLLECT_POPUP);
}

export function addTrackToPlaylist({ commit }, payload) {
    const tracks = Array.isArray(payload.tracks)
        ? payload.tracks
        : [payload.tracks];
    commit(types.ADD_TRACK_TO_PLAYLIST, { tracks });
}

export async function subscribePlaylist({ commit }, payload) {
    const resp = await ApiRenderer.subscribePlaylist(payload.id);
    if (resp.code === 200) {
        commit(types.SUBSCRIBE_PLAYLIST, payload);
        return resp;
    }
    throw resp;
}

export async function unsubscribePlaylist({ commit }, payload) {
    const resp = await ApiRenderer.unsubscribePlaylist(payload.id);
    if (resp.code === 200) {
        commit(types.UNSUBSCRIBE_PLAYLIST, payload);
        return resp;
    }
    throw resp;
}

import Api from '@/util/api/index';
import * as types from './mutation-types';
import { Track, Video } from '@/util/models';
import { LOOP_MODE } from './modules/playlist';

/**
 * @typedef {object} ActionContext
 * @property {import('vuex').Commit} commit
 * @property {import('vuex').Dispatch} dispatch
 * @property {import('./getters').Getters} getters
 * @property {import('./modules/index').State} state
 */

/**
 * @param {ActionContext} param0
 * @param {import('./modules/index').SettingsState} payload
 */
export async function updateSettings({ commit, state }, payload) {
    commit(types.UPDATE_SETTINGS, payload);
    sessionStorage.setItem('settings', JSON.stringify(state.settings));
    await Api.writeSettings(state.settings);
}

/**
 * @param {ActionContext} param0
 */
export async function resetSettings({ commit }) {
    await Api.resetSettings();
    const st = await Api.getCurrentSettings();
    commit(types.UPDATE_SETTINGS, st);
}

/**
 * @param {ActionContext} param0
 */
export function storeUiState({ state }) {
    let obj = {};
    [
        'audioVolume',
        'audioMute',
        'radioMode'
    ].forEach(k => obj[k] = state.ui[k]);
    localStorage.setItem('ui', JSON.stringify(obj));
}

/**
 * @param {ActionContext} param0
 */
export function restoreUiState({ commit, dispatch }) {
    try {
        const obj = JSON.parse(localStorage.getItem('ui'));
        commit(types.RESTORE_UI_STATE, obj);
    } catch (e) {
        localStorage.removeItem('ui');
    }
    dispatch('updateUiAudioSrc');
    dispatch('updateUiLyric');
}

/**
 * @param {ActionContext} param0
 */
export async function storeUserInfo({ state }) {
    localStorage.setItem('user', JSON.stringify(state.user.info));
    const cookie = await Api.getCookie();
    localStorage.setItem('cookie', JSON.stringify(cookie));
}

/**
 * @param {ActionContext} param0
 */
export async function restoreUserInfo({ commit, dispatch }) {
    const user = localStorage.getItem('user');
    const cookie = localStorage.getItem('cookie');
    if (user && cookie) {
        const userObj = JSON.parse(user);
        const cookieObj = JSON.parse(cookie);
        commit(types.SET_USER_INFO, userObj);
        commit(types.SET_LOGIN_PENDING, true);
        Api.updateCookie(cookieObj);
        const resp = await Api.refreshLogin();
        commit(types.SET_LOGIN_PENDING, false);
        if (resp.code === 200) {
            dispatch('setLoginValid');
            return true;
        } else {
            Api.updateCookie();
            return false;
        }
    }
}

/**
 * @param {ActionContext} param0
 */
export async function updateUserSignStatus({ commit }) {
    commit(types.SET_USER_SIGN_PENDING, true);
    const timestamp = Date.now();
    const resp = await Api.getDailyTask();
    commit(types.SET_USER_SIGN_PENDING, false);
    if (resp.code === 200) {
        const { pcSign, mobileSign } = resp;
        commit(types.SET_USER_SIGN_STATUS, { timestamp, pcSign, mobileSign });
    }
}

/**
 * @param {ActionContext} param0
 */
export async function signDailyTask({ commit }, { type }) {
    commit(types.SET_USER_SIGN_PENDING, true);
    let resp;
    switch (type) {
        case 0:
            resp = await Api.postDailyTaskE(0);
            if (resp.code === 200) {
                commit(types.SET_USER_SIGN_STATUS, { mobileSign: true });
            }
            break;
        case 1:
            resp = await Api.postDailyTask(1);
            if (resp.code === 200) {
                commit(types.SET_USER_SIGN_STATUS, { pcSign: true });
            }
            break;
    }
    commit(types.SET_USER_SIGN_PENDING, false);
    return resp;
}

/**
 * @param {ActionContext} param0
 */
export async function checkin({ state, dispatch }) {
    let points = 0;
    if (!state.user.signStatus.mobileSign) {
        const resp = await dispatch('signDailyTask', { type: 0 });
        if (resp.code === 200) points += resp.point;
    }
    if (!state.user.signStatus.pcSign) {
        const resp = await dispatch('signDailyTask', { type: 1 });
        if (resp.code === 200) points += resp.point;
    }
    return points;
}

/**
 * @param {ActionContext} _ 
 * @param {{ids: {id: number; v: number}[]}} payload
 */
export async function getTrackDetail(_, { ids }) {
    const tracks = await Api.bulkTrackDetail(ids.map(i => i.id));
    return tracks.map(t => new Track(t));
}

/**
 * @param {ActionContext} param0
 */
export async function updateUserPlaylistDetail({ commit, dispatch }, payload) {
    const listId = typeof payload === 'number' ? payload : payload.id;
    const resp = await Api.getListDetail(listId, 0);
    if (resp.code === 200) {
        // TODO: only user's favorite list's track should be stored
        resp.playlist.tracks = await dispatch('getTrackDetail', { ids: resp.playlist.trackIds });
        commit(types.UPDATE_USER_PLAYLIST, resp.playlist);
    }
}

/**
 * @param {ActionContext} param0
 */
export async function updateUserPlaylist({ state, commit, dispatch }) {
    const { playlist } = await Api.getUserPlaylist(state.user.info.id);
    // TODO: extract action updateUserInfo
    commit(types.UPDATE_USER_INFO, playlist[0].creator);
    commit(types.SET_USER_PLAYLISTS, playlist);
    if (playlist[0].name.endsWith('喜欢的音乐')) {
        dispatch('updateUserPlaylistDetail', playlist[0].id);
    }
    return playlist;
}

/**
 * @param {ActionContext} param0
 */
export function setLoginValid({ commit, dispatch }, payload) {
    if (payload === undefined || payload === true) {
        commit(types.SET_LOGIN_VALID, true);
        dispatch('updateUserSignStatus');
        dispatch('updateUserPlaylist');
    } else {
        commit(types.SET_LOGIN_VALID, false);
    }
}

/**
 * @param {ActionContext} param0
 */
export async function login({ commit, dispatch }, payload) {
    commit(types.SET_LOGIN_PENDING, true);
    const resp = await Api.login(payload.acc, payload.pwd);
    if (resp.code === 200) {
        commit(types.SET_USER_INFO, resp);
        dispatch('setLoginValid', true);
        dispatch('storeUserInfo');
    }
    commit(types.SET_LOGIN_PENDING, false);
    return resp;
}

/**
 * @param {ActionContext} param0
 */
export async function logout({ commit }) {
    const resp = await Api.logout();
    if (resp == 200) {
        commit(types.SET_USER_INFO, {});
        commit(types.SET_USER_PLAYLISTS, []);
        commit(types.SET_LOGIN_VALID, false);
        commit(types.SET_USER_SIGN_STATUS, null);
        ['user', 'cookie'].forEach(k => localStorage.removeItem(k));
    }
}

/**
 * @param {ActionContext} param0
 */
export async function search({ state, commit }, { keyword, type, limit = 20, offset = 0 }) {
    commit(types.SET_SEARCH_PENDING, true);
    if (state.ui.search.type !== type || state.ui.search.keyword !== keyword) {
        commit(types.SET_SEARCH_RESULT, { total: 0, items: [] });
    }
    commit(types.SET_SEARCH_PARAM, { keyword, type, offset });
    const resp = await Api.search(keyword, type, limit, offset);
    if (state.ui.search.type !== type) return;
    if (!resp.result) resp.result = {};
    if (resp.code === 200) {
        let result = {
            total: 0,
            items: []
        };
        switch (type) {
            case 'song':
                result.total = resp.result.songCount || 0;
                if (result.total > 0) {
                    result.items = resp.result.songs.map(i => new Track(i));
                }
                break;
            case 'artist':
                result.total = resp.result.artistCount || 0;
                if (result.total > 0) {
                    result.items = resp.result.artists;
                }
                break;
            case 'album':
                result.total = resp.result.albumCount || 0;
                if (result.total > 0) {
                    result.items = resp.result.albums;
                }
                break;
            case 'playlist':
                result.total = resp.result.playlistCount || 0;
                if (result.total > 0) {
                    result.items = resp.result.playlists;
                }
                break;
            case 'video':
                result.total = resp.result.videoCount || 0;
                if (result.total > 0) {
                    result.items = resp.result.videos.map(v => new Video(v));
                }
                break;
            case 'user':
                result.total = resp.result.userprofileCount || 0;
                if (result.total > 0) {
                    result.items = resp.result.userprofiles;
                }
        }
        commit(types.SET_SEARCH_RESULT, result);
    } else {
        commit(types.SET_SEARCH_ERROR, resp);
    }
    commit(types.SET_SEARCH_PENDING, false);
}

/**
 * @param {ActionContext} param0
 */
export async function updateUiAudioSrc({ commit, state, getters }, { ignoreCache = false } = {}) {
    const quality = state.settings.bitRate;
    const track = getters.playing;
    if (track && track.id) {
        const resp = await Api.getMusicUrlLocal(track.id, quality, ignoreCache);
        commit(types.UPDATE_PLAYING_URL, resp.url);
    } else {
        commit(types.UPDATE_PLAYING_URL, '');
    }
}

/**
 * @param {ActionContext} param0
 */
export function setAudioVolume({ commit }, payload) {
    commit(types.SET_AUDIO_VOLUME, payload);
}

/**
 * @param {ActionContext} param0
 */
export async function updateUiLyric({ commit, getters }, { ignoreCache = false } = {}) {
    const track = getters.playing;
    if (track && track.id) {
        commit(types.SET_LYRIC_LOADING, true);
        const lyric = await Api.getMusicLyricCached(track.id, ignoreCache);
        commit(types.SET_ACTIVE_LYRIC, lyric);
        commit(types.SET_LYRIC_LOADING, false);
    } else {
        commit(types.SET_ACTIVE_LYRIC, {});
    }
}

/**
 * @param {ActionContext} param0
 */
export function playAudio({ commit }) {
    commit(types.SET_AUDIO_PAUSED, false);
}

/**
 * @param {ActionContext} param0
 */
export function pauseAudio({ commit }) {
    commit(types.SET_AUDIO_PAUSED, true);
}

/**
 * @param {ActionContext} param0
 */
export async function playTrackIndex({ state, commit, dispatch }, index) {
    if (state.ui.radioMode === true) {
        commit(types.SET_RADIO_INDEX, index);
    } else {
        commit(types.SET_CURRENT_INDEX, index);
    }
    dispatch('updateUiLyric');
    await dispatch('updateUiAudioSrc');
    dispatch('playAudio');
}

/**
 * @param {ActionContext} param0
 */
export function playNextTrack({ dispatch, getters }) {
    const { index, list, loopMode } = getters.queue;
    let nextIndex;
    switch (loopMode) {
        case LOOP_MODE.RANDOM:
            nextIndex = Math.floor(Math.random() * list.length);
            break;
        default:
            nextIndex = (index + 1) % list.length;
            break;
    }
    dispatch('playTrackIndex', nextIndex);
}

/**
 * @param {ActionContext} param0
 */
export function playPreviousTrack({ dispatch, getters }) {
    const { index, list, loopMode } = getters.queue;
    let nextIndex;
    switch (loopMode) {
        case LOOP_MODE.RANDOM:
            nextIndex = Math.floor(Math.random() * list.length);
            break;
        default:
            nextIndex = (index + list.length - 1) % list.length;
            break;
    }
    dispatch('playTrackIndex', nextIndex);
}

/**
 * @param {ActionContext} param0
 */
export async function playPlaylist({ commit, dispatch, state }, { tracks, source }) {
    const list = tracks.map(t => Object.assign({}, t));
    if (source) {
        list.forEach(t => t.source = source);
    }
    commit(types.SET_PLAY_LIST, list);
    if (state.ui.radioMode === true) {
        commit(types.ACTIVATE_RADIO, false);
    }
    let firstIndex = 0;
    if (state.playlist.loopMode === LOOP_MODE.RANDOM) {
        firstIndex = Math.floor(Math.random() * list.length);
    }
    dispatch('playTrackIndex', firstIndex);
}

/**
 * @param {ActionContext} param0
 */
export function clearPlaylist({ state, commit, dispatch }) {
    if (state.ui.radioMode) {
        commit(types.RESTORE_RADIO, { list: [], index: 0 });
    } else {
        commit(types.SET_PLAY_LIST, []);
        commit(types.SET_CURRENT_INDEX, 0);
    }
    dispatch('updateUiAudioSrc');
    dispatch('updateUiLyric');
}

export function storePlaylist({ state }) {
    localStorage.setItem('playlist', JSON.stringify(state.playlist));
}

/**
 * @param {ActionContext} param0
 */
export function restorePlaylist({ commit }) {
    try {
        const stored = localStorage.getItem('playlist');
        if (stored) {
            const playlist = JSON.parse(stored);
            commit(types.RESTORE_PLAYLIST, playlist);
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.info('Playlist stored in localStorage not valid.');
    }
}

/**
 * @param {ActionContext} param0
 */
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

/**
 * @param {ActionContext} _
 */
export async function collectTrack(_, { playlist, tracks }) {
    const resp = await Api.collectTrack(playlist, ...tracks);
    if (resp.code === 200) {
        return resp;
    }
    throw resp;
}

/**
 * @param {ActionContext} _
 */
export async function uncollectTrack(_, { playlist, tracks }) {
    const resp = await Api.uncollectTrack(playlist, ...tracks);
    if (resp.code === 200) {
        return resp;
    }
    throw resp;
}

/**
 * @param {ActionContext} _
 */
export async function favoriteTrack(_, { id, favorite = true }) {
    const resp = await Api.likeSongE(id, favorite);
    if (resp.code === 200) {
        return resp;
    }
    throw resp;
}

/**
 * @param {ActionContext} param0
 */
export function nextLoopMode({ commit, state }) {
    const { loopMode } = state.playlist;
    switch (loopMode) {
        case LOOP_MODE.LIST:
            commit(types.SET_LOOP_MODE_SINGLE);
            break;
        case LOOP_MODE.SINGLE:
            commit(types.SET_LOOP_MODE_RANDOM);
            break;
        case LOOP_MODE.RANDOM:
            commit(types.SET_LOOP_MODE_LIST);
            break;
    }
}

/**
 * @param {ActionContext} param0
 */
export function insertTrackIntoPlaylist({ commit, state }, payload) {
    let tracks = Array.isArray(payload.tracks)
        ? payload.tracks
        : [payload.tracks];
    if (payload.source) {
        tracks = tracks.map(t => Object.assign({}, t, { source: payload.source }));
    }
    const index = payload.index || state.playlist.index;
    commit(types.INSERT_TRACK_INTO_PLAYLIST, { tracks, index });
}

/**
 * @param {ActionContext} param0
 */
export function removeTrackFromPlaylist({ getters, commit, dispatch }, payload) {
    const track1 = getters.playing;
    commit(types.REMOVE_TRACK_FROM_PLAYLIST, payload);
    const track2 = getters.playing;
    if (!track2 || track1.id !== track2.id) {
        dispatch('updateUiLyric');
        dispatch('updateUiAudioSrc');
    }
}

/**
 * @param {ActionContext} param0
 */
export async function subscribePlaylist({ commit }, payload) {
    const resp = await Api.subscribePlaylist(payload.id);
    if (resp.code === 200) {
        commit(types.SUBSCRIBE_PLAYLIST, payload);
        return resp;
    }
    throw resp;
}

/**
 * @param {ActionContext} param0
 */
export async function unsubscribePlaylist({ commit }, payload) {
    const resp = await Api.unsubscribePlaylist(payload.id);
    if (resp.code === 200) {
        commit(types.UNSUBSCRIBE_PLAYLIST, payload);
        return resp;
    }
    throw resp;
}

/**
 * @param {ActionContext} param0
 */
export async function updateUserAlbums({ commit }) {
    const resp = await Api.getSubscribedAlumbs(1000);
    if (resp.code === 200) {
        commit(types.SET_USER_ALBUMS, resp.data);
    }
}

/**
 * @param {ActionContext} param0
 */
export async function updateRecommendSongs({ commit }) {
    const resp = await Api.getRecommendSongs();
    if (resp.code === 200) {
        commit(types.SET_RECOMMEND_SONGS, resp.recommend);
    }
}

/**
 * @param {ActionContext} param0
 */
export async function updateRecommendStatistics({ commit }) {
    const resp = await Api.getRecommendStatistics();
    if (resp.code === 200) {
        commit(types.SET_RECOMMEND_STATISTICS, resp.data);
    }
}

/**
 * @param {ActionContext} param0
 */
export async function dislikeRecommend({ commit }, id) {
    const resp = await Api.dislikeRecommend(id);
    if (resp.code === 200) {
        commit(types.REPLACE_RECOMMEND_SONG, { id, track: resp.data });
    }
    return resp;
}

/**
 * @param {ActionContext} param0
 */
export async function subscribeAlbum({ commit }, payload) {
    const resp = await Api.subscribeAlbum(payload.id);
    if (resp.code === 200 && typeof resp.time === 'number') {
        commit(types.SUBSCRIBE_ALBUM, payload);
        return;
    }
    throw resp;
}

/**
 * @param {ActionContext} param0
 */
export async function unsubscribeAlbum({ commit }, payload) {
    const resp = await Api.unsubscribeAlbum(payload.id);
    if (resp.code === 200 && typeof resp.time === 'number') {
        commit(types.UNSUBSCRIBE_ALBUM, payload);
        return;
    }
    throw resp;
}

/**
 * @param {ActionContext} param0
 */
export async function updateUserArtists({ commit }) {
    const resp = await Api.getSubscribedArtists(1000);
    if (resp.code === 200) {
        commit(types.SET_USER_ARTISTS, resp.data);
    }
}

/**
 * @param {ActionContext} param0
 */
export async function followArtist({ commit }, payload) {
    const resp = await Api.followArtist(payload.id);
    if (resp.code === 200) {
        commit(types.SUBSCRIBE_ARTIST, payload);
        return;
    }
    throw resp;
}

/**
 * @param {ActionContext} param0
 */
export async function unfollowArtist({ commit }, payload) {
    const resp = await Api.unfollowArtist(payload.id);
    if (resp.code === 200) {
        commit(types.UNSUBSCRIBE_ARTIST, payload);
        return;
    }
    throw resp;
}

/**
 * @param {ActionContext} param0
 */
export async function updateUserVideos({ commit }) {
    const resp = await Api.getFavoriteVideos(1000);
    commit(types.SET_USER_VIDEOS, resp.data);
}

/**
 * @param {ActionContext} param0
 */
export async function subscribeVideo({ commit }, payload) {
    const { id, type } = payload;
    const func = type === 0 ? Api.subscribeMV : Api.subscribeVideo;
    const resp = await func(id);
    if (resp.code === 200) {
        commit(types.SUBSCRIBE_VIDEO, payload);
        return;
    }
    throw resp;
}

/**
 * @param {ActionContext} param0
 */
export async function unsubscribeVideo({ commit }, payload) {
    const { id, type } = payload;
    const func = type === 0 ? Api.unsubscribeMV : Api.unsubscribeVideo;
    const resp = await func(id);
    if (resp.code === 200) {
        commit(types.UNSUBSCRIBE_VIDEO, payload);
        return;
    }
    throw resp;
}

/**
 * @param {ActionContext} _
 */
export async function likeResource(_, id) {
    const resp = await Api.likeResource(id);
    if (resp.code === 200) return resp;
    throw resp;
}

/**
 * @param {ActionContext} _
 */
export async function unlikeResource(_, id) {
    const resp = await Api.unlikeResource(id);
    if (resp.code === 200) return resp;
    throw resp;
}

/**
 * @param {ActionContext} param0
 */
export function storeRadio({ state }) {
    localStorage.setItem('radio', JSON.stringify(state.radio));
}

/**
 * @param {ActionContext} param0
 */
export function restoreRadio({ commit }) {
    try {
        const stored = localStorage.getItem('radio');
        if (stored) {
            const radio = JSON.parse(stored);
            commit(types.RESTORE_RADIO, radio);
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.info('Radio stored in localStorage not valid.');
    }
}

/**
 * @param {ActionContext} param0
 */
export async function getRadio({ commit }) {
    const resp = await Api.getRadioE();
    if (resp.code === 200) {
        const tracks = resp.data.map(t => new Track(t));
        commit(types.APPEND_RADIO, { tracks });
    }
}

/**
 * @param {ActionContext} param0
 */
export async function activateRadio({ state, commit, dispatch }, payload) {
    if (payload === true) {
        commit(types.ACTIVATE_RADIO, true);
        if (state.radio.list.length === 0) {
            await dispatch('getRadio');
        }
    } else {
        commit(types.ACTIVATE_RADIO, false);
    }
}

/**
 * time in ms
 * @param {ActionContext} _
 */
export async function likeRadio(_, { id, time, like = true }) {
    const resp = await Api.likeRadioE(id, time, like);
    if (resp.code === 200) {
        return resp;
    }
    throw resp;
}

/**
 * time in ms
 * @param {ActionContext} _
 */
export async function skipRadio(_, { id, time }) {
    const resp = await Api.skipRadioE(id, time);
    if (resp.code === 200) {
        return resp;
    }
    throw resp;
}

/**
 * time in ms
 * @param {ActionContext} _
 */
export async function trashRadio(_, { id, time }) {
    const resp = await Api.addRadioTrashE(id, time);
    if (resp.code === 200) {
        return resp;
    }
    throw resp;
}

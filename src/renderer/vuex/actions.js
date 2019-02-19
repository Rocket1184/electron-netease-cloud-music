import Api from '@/util/api/index';
import * as types from './mutation-types';
import { Track, Video } from '@/util/models';
import { LOOP_MODE } from './modules/playlist';

export async function updateSettings({ commit, state }, payload) {
    commit(types.UPDATE_SETTINGS, payload);
    sessionStorage.setItem('settings', JSON.stringify(state.settings));
    await Api.writeSettings(state.settings);
}

export async function resetSettings({ commit }) {
    await Api.resetSettings();
    const st = await Api.getCurrentSettings();
    commit(types.UPDATE_SETTINGS, st);
}

export async function storeUserInfo({ state }) {
    localStorage.setItem('user', JSON.stringify(state.user.info));
    const cookie = await Api.getCookie();
    localStorage.setItem('cookie', JSON.stringify(cookie));
}

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

export async function updateUserPlaylistDetail({ commit }, payload) {
    const listId = typeof payload === 'number' ? payload : payload.id;
    const resp = await Api.getListDetail(listId);
    commit(types.UPDATE_USER_PLAYLIST, resp.playlist);
}

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

export function setLoginValid({ commit, dispatch }, payload) {
    if (payload === undefined || payload === true) {
        commit(types.SET_LOGIN_VALID, true);
        dispatch('updateUserSignStatus');
        dispatch('updateUserPlaylist');
    } else {
        commit(types.SET_LOGIN_VALID, false);
    }
}

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

export async function logout({ commit }) {
    const resp = await Api.logout();
    if (resp == 200) {
        commit(types.SET_USER_INFO, {});
        commit(types.SET_USER_PLAYLISTS, []);
        commit(types.SET_LOGIN_VALID, false);
        commit(types.SET_UI_FAV_ALBUM, null);
        commit(types.SET_UI_FAV_VIDEO, null);
        commit(types.SET_UI_FAV_ARTIST, null);
        commit(types.SET_USER_SIGN_STATUS, null);
        ['user', 'cookie'].forEach(k => localStorage.removeItem(k));
    }
}

export async function search({ state, commit }, { keyword, type, limit = 20, offset = 0 }) {
    commit(types.SET_SEARCH_PENDING, true);
    if (state.ui.search.type !== type || state.ui.search.keyword !== keyword) {
        commit(types.SET_SEARCH_RESULT, { total: 0, items: [] });
    }
    commit(types.SET_SEARCH_PARAM, { keyword, type, offset });
    const resp = await Api.search(keyword, type, limit, offset);
    if (state.ui.search.type !== type) return;
    if (resp.code === 200) {
        let result = {
            total: 0,
            items: null
        };
        switch (type) {
            case 'song':
                result.total = resp.result.songCount;
                result.items = resp.result.songs.map(i => new Track(i));
                break;
            case 'artist':
                result.total = resp.result.artistCount;
                result.items = resp.result.artists;
                break;
            case 'album':
                result.total = resp.result.albumCount;
                result.items = resp.result.albums;
                break;
            case 'playlist':
                result.total = resp.result.playlistCount;
                result.items = resp.result.playlists;
                break;
            case 'video':
                result.total = resp.result.videoCount;
                result.items = resp.result.videos.map(v => new Video(v));
                break;
        }
        commit(types.SET_SEARCH_RESULT, result);
    } else {
        commit(types.SET_SEARCH_ERROR, resp);
    }
    commit(types.SET_SEARCH_PENDING, false);
}

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

export function playAudio({ commit }) {
    commit(types.RESUME_PLAYING_MUSIC);
}

export function pauseAudio({ commit }) {
    commit(types.PAUSE_PLAYING_MUSIC);
}

export async function playTrackIndex({ state, commit, dispatch }, index) {
    if (state.ui.radioMode === true) {
        commit(types.SET_RADIO_INDEX, index);
    } else {
        commit(types.SET_CURRENT_INDEX, index);
    }
    dispatch('updateUiLyric');
    await dispatch('updateUiAudioSrc');
    commit(types.RESUME_PLAYING_MUSIC);
}

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

export async function playPlaylist({ commit, dispatch, state }, { tracks, source }) {
    const list = tracks.map(t => Object.assign({}, t));
    if (source) {
        list.forEach(t => t.source = source);
    }
    commit(types.SET_PLAY_LIST, list);
    if (state.ui.radioMode === true) {
        commit(types.ACTIVATE_RADIO, false);
    }
    let firstIndex;
    switch (state.playlist.loopMode) {
        case LOOP_MODE.RANDOM:
            firstIndex = Math.floor(Math.random * state.playlist.list.length);
            break;
        default:
            firstIndex = 0;
            break;
    }
    dispatch('playTrackIndex', firstIndex);
}

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

export function restorePlaylist({ commit, dispatch }) {
    try {
        const stored = localStorage.getItem('playlist');
        if (stored) {
            const playlist = JSON.parse(stored);
            commit(types.RESTORE_PLAYLIST, playlist);
            dispatch('updateUiAudioSrc');
            dispatch('updateUiLyric');
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.info('Playlist stored in localStorage not valid.');
    }
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

export async function collectTrack(_, { playlist, tracks }) {
    const resp = await Api.collectTrack(playlist, ...tracks);
    if (resp.code === 200) {
        return resp;
    }
    throw resp;
}

export async function uncollectTrack(_, { playlist, tracks }) {
    const resp = await Api.uncollectTrack(playlist, ...tracks);
    if (resp.code === 200) {
        return resp;
    }
    throw resp;
}

export async function favoriteTrack({ state, dispatch }, { favorite, id }) {
    const playlist = state.user.playlist[0].id;
    const payload = { playlist, tracks: [id] };
    if (favorite) {
        await dispatch('collectTrack', payload);
    } else {
        await dispatch('uncollectTrack', payload);
    }
    // it would take some time for NetEase to update playlist cover
    // img, so we just wait 200 ms
    await new Promise(_ => setTimeout(() => _(), 200));
    await dispatch('updateUserPlaylistDetail', playlist);
}

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

export function removeTrackFromPlaylist({ getters, commit, dispatch }, payload) {
    const track1 = getters.playing;
    commit(types.REMOVE_TRACK_FROM_PLAYLIST, payload);
    const track2 = getters.playing;
    if (!track2 || track1.id !== track2.id) {
        dispatch('updateUiLyric');
        dispatch('updateUiAudioSrc');
    }
}

export async function subscribePlaylist({ commit }, payload) {
    const resp = await Api.subscribePlaylist(payload.id);
    if (resp.code === 200) {
        commit(types.SUBSCRIBE_PLAYLIST, payload);
        return resp;
    }
    throw resp;
}

export async function unsubscribePlaylist({ commit }, payload) {
    const resp = await Api.unsubscribePlaylist(payload.id);
    if (resp.code === 200) {
        commit(types.UNSUBSCRIBE_PLAYLIST, payload);
        return resp;
    }
    throw resp;
}

export async function updateUserAlbums({ commit }) {
    const resp = await Api.getSubscribedAlumbs(1000);
    commit(types.SET_USER_ALBUMS, resp.data);
}

export async function setUiFavAlbum({ commit }, id) {
    const resp = await Api.getAlbumDetailW(id);
    commit(types.SET_UI_FAV_ALBUM, resp);
}

export async function setUiTempPlaylist({ commit }, id) {
    const resp = await Api.getListDetail(id);
    commit(types.SET_UI_TEMP_PLAYLIST, resp.playlist);
}

export async function setUiRelatedPlaylists({ commit }, id) {
    const resp = await Api.getRelatedPlaylists(id);
    commit(types.SET_UI_TEMP_RELATED_PLAYLISTS, resp.data);
}

export async function updateRecommendSongs({ commit }) {
    const resp = await Api.getRecommendSongs();
    commit(types.SET_RECOMMEND_SONGS, resp.recommend);
}

export async function updateRecommendStatistics({ commit }) {
    const resp = await Api.getRecommendStatistics();
    commit(types.SET_RECOMMEND_STATISTICS, resp.data);
}

export async function dislikeRecommend({ commit }, id) {
    const resp = await Api.dislikeRecommend(id);
    if (resp.code === 200) {
        commit(types.REPLACE_RECOMMEND_SONG, { id, track: resp.data });
    }
    return resp;
}

export async function setUiTempAlbum({ commit }, id) {
    const resp = await Api.getAlbumDetailW(id);
    commit(types.SET_UI_TEMP_ALBUM, resp);
}

export async function setUiRelatedAlbums({ commit }, id) {
    const resp = await Api.getRelatedAlbums(id);
    commit(types.SET_UI_TEMP_RELATED_ALBUMS, resp.data);
}

export async function subscribeAlbum({ commit }, payload) {
    const resp = await Api.subscribeAlbum(payload.id);
    if (resp.code === 200 && typeof resp.time === 'number') {
        commit(types.SUBSCRIBE_ALBUM, payload);
        return;
    }
    throw resp;
}

export async function unsubscribeAlbum({ commit }, payload) {
    const resp = await Api.unsubscribeAlbum(payload.id);
    if (resp.code === 200 && typeof resp.time === 'number') {
        commit(types.UNSUBSCRIBE_ALBUM, payload);
        return;
    }
    throw resp;
}

export async function updateUserArtists({ commit }) {
    const resp = await Api.getSubscribedArtists(1000);
    if (resp.code === 200) {
        commit(types.SET_USER_ARTISTS, resp.data);
    }
}

export async function setUiArtist({ commit }, { mutation, id }) {
    const resp = await Api.getArtistDetailW(id);
    commit(mutation, resp);
}

export function setUiFavArtist({ dispatch }, id) {
    return dispatch('setUiArtist', { mutation: types.SET_UI_FAV_ARTIST, id });
}

export function setUiTempArtist({ dispatch }, id) {
    return dispatch('setUiArtist', { mutation: types.SET_UI_TEMP_ARTIST, id });
}

export async function followArtist({ commit }, payload) {
    const resp = await Api.followArtist(payload.id);
    if (resp.code === 200) {
        commit(types.SUBSCRIBE_ARTIST, payload);
        return;
    }
    throw resp;
}

export async function unfollowArtist({ commit }, payload) {
    const resp = await Api.unfollowArtist(payload.id);
    if (resp.code === 200) {
        commit(types.UNSUBSCRIBE_ARTIST, payload);
        return;
    }
    throw resp;
}

export async function updateUserVideos({ commit }) {
    const resp = await Api.getFavoriteVideos(1000);
    commit(types.SET_USER_VIDEOS, resp.data);
}

export async function setUiVideo({ commit }, { id, type, mutation }) {
    let resp;
    if (type === 0) {
        resp = await Api.getMVDetail(id);
        resp.data.type = type;
        resp.data.subed = resp.subed;
        commit(mutation, resp.data);
    } else if (type === 1) {
        resp = await Api.getVideoDetail(id);
        resp.data.type = type;
        commit(mutation, resp.data);
    }
    return resp;
}

export function setUiFavVideo({ dispatch }, { id, type }) {
    return dispatch('setUiVideo', { id, type, mutation: types.SET_UI_FAV_VIDEO });
}

export function setUiTempVideo({ dispatch }, { id, type }) {
    return dispatch('setUiVideo', { id, type, mutation: types.SET_UI_TEMP_VIDEO });
}

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

export async function likeResource(_, id) {
    const resp = await Api.likeResource(id);
    if (resp.code === 200) return resp;
    throw resp;
}

export async function unlikeResource(_, id) {
    const resp = await Api.unlikeResource(id);
    if (resp.code === 200) return resp;
    throw resp;
}

export function storeRadio({ state }) {
    localStorage.setItem('radio', JSON.stringify(state.radio));
}

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

export async function getRadio({ commit }) {
    const resp = await Api.getRadio();
    if (resp.code === 200) {
        const tracks = resp.data.map(t => new Track(t));
        commit(types.APPEND_RADIO, { tracks });
    }
}

export async function dislikeRadioSong(_, { id, time }) {
    const resp = await Api.dislikeRadioSong(id, time);
    if (resp.code === 200) {
        return resp;
    }
    throw resp;
}

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

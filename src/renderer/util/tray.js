import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';

import debug from 'debug';

import {
    SET_LOGIN_VALID,
    SET_AUDIO_VOLUME,
    RESTORE_UI_STATE,
    UPDATE_PLAYING_URL,
    UPDATE_USER_PLAYLIST
} from '@/store/mutation-types';

/**
 * @typedef {import('@/store').Store} Store
 * @typedef {import('@/store').State} State
 */

const TrayEmitter = new EventEmitter();
const TAG = 'Tray:IPC';
const d = debug(TAG);

ipcRenderer.on(TAG, (event, /** @type {string} */ type, ...args) => {
    d('🔻 %s %o', type, args);
    TrayEmitter.emit(type, ...args);
});

/**
 * @param {string} type
 * @param  {...any} args
 */
function send(type, ...args) {
    d('🔺 %s %o', type, args);
    ipcRenderer.send(TAG, type, ...args);
}

/**
 * @param {State} state
 * @param {number} trackId
 */
function isFavorite(state, trackId) {
    const favoriteList = state.user.playlist[0];
    if (state.user.loginValid
        && favoriteList
        && favoriteList.tracks.find(t => t.id === trackId)) {
        return true;
    }
    return false;
}

/**
 * @param {State} state 
 * @param {Models.Track} track 
 * @typedef {{id: number, name: string, artist: string, album: string, canFavorite: boolean, favorite: boolean, canDislike: boolean}} TrayTrack
 */
function sendTrackMeta(state, track) {
    let payload = { id: 0 };
    if (track && track.id) {
        payload = {
            id: track.id,
            name: track.name,
            artist: track.artistName,
            album: track.album.name,
            canFavorite: state.user.loginValid,
            favorite: isFavorite(state, track.id),
            canDislike: state.ui.radioMode
        };
    }
    send('track', payload);
}

/**
 * Vuex mutation subscribe handler
 * @param {import('vuex').MutationPayload} mutation
 * @param {State} state
 */
function subscribeHandler(mutation, state) {
    const queue = state.ui.radioMode === true ? state.radio : state.playlist;
    const track = queue.list[queue.index];
    switch (mutation.type) {
        case SET_LOGIN_VALID:
        case UPDATE_PLAYING_URL:
        case UPDATE_USER_PLAYLIST:
            sendTrackMeta(state, track);
            break;
        case SET_AUDIO_VOLUME:
        case RESTORE_UI_STATE:
            send('mute', state.ui.audioMute);
            break;
    }
}

/**
 * @param {Store} store 
 */
export function injectStore(store) {
    store.subscribe(subscribeHandler);
    TrayEmitter.on('playpause', () => {
        if (store.state.ui.paused) store.dispatch('playAudio');
        else store.dispatch('pauseAudio');
    });
    TrayEmitter.on('next', () => {
        store.dispatch('playNextTrack');
        if (store.state.ui.radioMode === true) {
            const time = Math.trunc(document.querySelector('audio').currentTime * 1000);
            store.dispatch('skipRadio', { id: store.getters.playing.id, time });
        }
    });
    TrayEmitter.on('prev', () => store.dispatch('playPreviousTrack'));
    TrayEmitter.on('favorite', async id => {
        const shouldFav = !isFavorite(store.state, id);
        try {
            let resp;
            if (store.state.ui.radioMode === true) {
                const time = Math.trunc(document.querySelector('audio').currentTime * 1000);
                resp = await store.dispatch('likeRadio', { id, like: shouldFav, time });
            } else {
                resp = await store.dispatch('favoriteTrack', { id, favorite: shouldFav });
            }
            store.dispatch('updateUserPlaylistDetail', resp.playlistId);
        } catch (e) { /* that's embarrassing */ }
    });
    TrayEmitter.on('dislike', id => {
        const time = Math.trunc(document.querySelector('audio').currentTime * 1000);
        store.dispatch('trashRadio', { id, time });
        store.dispatch('playNextTrack');
    });
    TrayEmitter.on('mute', () => {
        const mute = !store.state.ui.audioMute;
        store.dispatch('setAudioVolume', { mute });
    });
    TrayEmitter.on('get', () => {
        sendTrackMeta(store.state, store.getters.playing);
        send('mute', store.state.ui.audioMute);
    });
}

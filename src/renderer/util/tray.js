import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';

import debug from 'debug';

import {
    SET_LOGIN_VALID,
    SET_AUDIO_VOLUME,
    RESTORE_UI_STATE,
    UPDATE_PLAYING_URL,
    SET_USER_FAVOR_TRACKS
} from '@/store/mutation-types';

/**
 * @typedef {import('@/store').Store} Store
 * @typedef {import('@/store').State} State
 */

const TrayEmitter = new EventEmitter();
const TAG = 'Tray';
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
            favorite: state.user.favTrackIds.includes(track.id),
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
        case SET_USER_FAVOR_TRACKS:
            sendTrackMeta(state, track);
            break;
        case SET_AUDIO_VOLUME:
            if (typeof mutation.payload.mute === 'boolean') {
                send('mute', state.ui.audioMute);
            }
            break;
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
    TrayEmitter.on('favorite', async (id, shouldFav) => {
        try {
            if (store.state.ui.radioMode === true) {
                const time = Math.trunc(document.querySelector('audio').currentTime * 1000);
                await store.dispatch('likeRadio', { id, like: shouldFav, time });
            } else {
                await store.dispatch('favoriteTrack', { id, favorite: shouldFav });
            }
            store.dispatch('updateFavoriteTrackIds');
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

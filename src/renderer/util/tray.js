import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';

import debug from 'debug';

import {
    SET_LOGIN_VALID,
    UPDATE_PLAYING_URL,
    UPDATE_USER_PLAYLIST
} from '@/vuex/mutation-types';

const TrayEmitter = new EventEmitter();
const TAG = 'Tray:IPC';
const d = debug(TAG);

ipcRenderer.on(TAG, (event, type, ...args) => {
    d('🔻 %s %o', type, args);
    TrayEmitter.emit(type, ...args);
});

function send(type, ...args) {
    d('🔺 %s %o', type, args);
    ipcRenderer.send(TAG, type, ...args);
}

function isFavorite(state, trackId) {
    const favoriteList = state.user.playlist[0];
    if (state.user.loginValid
        && favoriteList
        && favoriteList.tracks.find(t => t.id === trackId)) {
        return true;
    }
    return false;
}

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

// Vuex mutation subscribe handler
function subscribeHandler(mutation, state) {
    const queue = state.ui.radioMode === true ? state.radio : state.playlist;
    const track = queue.list[queue.index];
    switch (mutation.type) {
        case SET_LOGIN_VALID:
        case UPDATE_PLAYING_URL:
        case UPDATE_USER_PLAYLIST:
            sendTrackMeta(state, track);
            break;
    }
}

export function injectStore(store) {
    store.subscribe(subscribeHandler);
    TrayEmitter.on('playpause', () => {
        if (store.state.ui.paused) store.dispatch('playAudio');
        else store.dispatch('pauseAudio');
    });
    TrayEmitter.on('next', () => store.dispatch('playNextTrack'));
    TrayEmitter.on('prev', () => store.dispatch('playPreviousTrack'));
    TrayEmitter.on('favorite', id => {
        store.dispatch('favoriteTrack', { favorite: !isFavorite(store.state, id), id });
    });
    TrayEmitter.on('dislike', id => {
        const time = Math.trunc(document.querySelector('audio').currentTime);
        store.dispatch('dislikeRadioSong', { id, time });
        store.dispatch('playNextTrack');
    });
    TrayEmitter.on('get', () => sendTrackMeta(store.state, store.getters.playing));
}

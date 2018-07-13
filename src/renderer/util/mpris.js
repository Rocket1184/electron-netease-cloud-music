'use strict';

import debug from 'debug';
import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';

import {
    UPDATE_PLAYING_URL
} from '@/vuex/mutation-types';

const MPRISEmitter = new EventEmitter();
const TAG = 'MPRIS:IPC';
const d = debug(TAG);

// IPC handler
const methodMap = new Map();

ipcRenderer.on(TAG, (event, type, id, ...args) => {
    d('🔻 %s %d %o', type, id, args);
    MPRISEmitter.emit(type, event, id, ...args);
});

function senderFn(type, ...args) {
    ipcRenderer.send(TAG, type, ...args);
    d('🔺 %s %o', type, args);
}

const MPRIS = new Proxy({}, {
    get(_, propName) {
        if (methodMap.has(propName)) {
            return methodMap.get(propName);
        }
        const fn = senderFn.bind(this, propName);
        methodMap.set(propName, fn);
        return fn;
    }
});

export default MPRIS;

/**
 * convert track to MPRIS meta
 * @param {import('@/util/models').Track} track
 * @returns MPRIS Metadata
 */
export function getTrackMeta(track) {
    return {
        id: track.id,
        'mpris:length': 300 * 1e6, // this should be changed when track loaded
        'mpris:artUrl': track.album.picUrl,
        'xesam:album': track.album.name,
        'xesam:albumArtist': track.artists.map(ar => ar.name),
        'xesam:artist': track.artistName,
        // 'xesam:discNumber': 0,
        'xesam:title': track.name,
        // 'xesam:tarckNumber': 0,
        // 'xesam:url': 'file:///dev/null', // at least It's unusable in KDE
        // 'xesam:useCount': 0,
        // 'xesam:userRating': 0
    };
}

/**
 * bind DOM events listener to MPRIS service
 * @param {HTMLAudioElement} audioEl
 */
export function bindEventListener(audioEl) {
    if (audioEl) {
        audioEl.addEventListener('loadedmetadata', () => {
            MPRIS.patchMetadata({ 'mpris:length': audioEl.duration * 1e6 });
        });
        audioEl.addEventListener('seeked', () => MPRIS.seeked(audioEl.currentTime));
        audioEl.addEventListener('playing', () => MPRIS.play());
        audioEl.addEventListener('pause', () => MPRIS.pause());
        audioEl.addEventListener('stalled', () => MPRIS.pause());
        MPRISEmitter.on('getPosition', (_, id) => {
            senderFn('getPosition', id, audioEl.currentTime * 1e6);
        });
        MPRISEmitter.on('seek', (_, __, pos) => audioEl.currentTime = pos);
        senderFn('renderer-ready');
    }
}

// Vuex mutation subscribe handler
function subscribeHandler(mutation, state) {
    const track = state.playlist.list[state.playlist.index];
    switch (mutation.type) {
        case UPDATE_PLAYING_URL:
            MPRIS.metadata(getTrackMeta(track));
            break;
        default:
            break;
    }
}

export function injectStore(store) {
    store.subscribe(subscribeHandler);
    MPRISEmitter.on('play', () => store.dispatch('playAudio'));
    MPRISEmitter.on('pause', () => store.dispatch('pauseAudio'));
    MPRISEmitter.on('next', () => store.dispatch('playNextTrack'));
    MPRISEmitter.on('prev', () => store.dispatch('playPreviousTrack'));
}

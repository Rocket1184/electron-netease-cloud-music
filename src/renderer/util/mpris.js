import debug from 'debug';
import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';
import debounce from 'lodash/debounce';

import {
    SET_COVER_IMG_SRC,
    RESTORE_UI_STATE,
    RESTORE_PLAYLIST,
    SET_AUDIO_VOLUME,
    SET_AUDIO_PAUSED
} from '@/store/mutation-types';

const MPRISEmitter = new EventEmitter();
const TAG = 'MPRIS:IPC';
const d = debug(TAG);

//          ipc                         PropertiesChanged signal
// Renderer --> Main(emit MPRIS events) -----------------------> DBus

ipcRenderer.on(TAG, (event, type, id, ...args) => {
    d('🔻 %s %d %o', type, id, args);
    MPRISEmitter.emit(type, ...args);
});

function ipcSend(type, ...args) {
    ipcRenderer.send(TAG, type, ...args);
    d('🔺 %s %o', type, args);
}

/**
 * bind audio element and MPRIS Emitter
 * @param {HTMLAudioElement} audioEl
 */
export function bindAudioElement(audioEl) {
    // TODO: check if listener exists before add
    audioEl.addEventListener('seeked', () => ipcSend('seeked', audioEl.currentTime));
    MPRISEmitter.on('position', (TrackId, Position) => {
        audioEl.currentTime = Position;
    });
    MPRISEmitter.on('seek', (Offset) => {
        audioEl.currentTime += Offset;
    });
    MPRISEmitter.on('stop', () => audioEl.currentTime = 0);
    ipcSend('renderer-ready');
    // TODO: MPRIS `LoopStatus` and `Shuffle` support; which DE support those props?
}

const debounceVolume = debounce(volume => ipcSend('volume', volume), 300);

/**
 * @param {Models.Track} track
 */
function trimMetadata(track, picUrl) {
    return {
        id: track.id,
        name: track.name,
        duration: track.duration,
        artistName: track.artistName,
        album: {
            name: track.album.name,
            picUrl
        },
        cd: track.cd,
        no: track.no
    };
}

/**
 * Vuex mutation subscribe handler
 * @param {import('vuex').MutationPayload} mutation 
 * @param {import('@/store').State} state 
 */
function subscribeHandler(mutation, state) {
    const queue = state.ui.radioMode === true ? state.radio : state.playlist;
    const track = queue.list[queue.index];
    switch (mutation.type) {
        case SET_COVER_IMG_SRC:
        case RESTORE_PLAYLIST:
            if (track) {
                ipcSend('metadata', trimMetadata(track, state.ui.coverImgSrc));
            } else {
                ipcSend('metadata', null);
                ipcSend('stop');
            }
            break;
        case SET_AUDIO_PAUSED:
            ipcSend(mutation.payload === true ? 'pause' : 'play');
            break;
        case RESTORE_UI_STATE:
            ipcSend('volume', mutation.payload.audioVolume);
            break;
        case SET_AUDIO_VOLUME:
            let { volume, mute } = mutation.payload;
            if (mute === true) {
                volume = 0;
            } else if (mute === false) {
                volume = state.ui.audioVolume;
            }
            debounceVolume(volume);
            break;
    }
}

/**
 * @param {import('@/store').Store} store 
 */
export function injectStore(store) {
    // ensure 'PlaybackStatus' is 'Stopped' when this module loads
    ipcSend('stop');
    store.subscribe(subscribeHandler);
    MPRISEmitter.on('play', () => store.dispatch('playAudio'));
    MPRISEmitter.on('stop', () => store.dispatch('pauseAudio'));
    MPRISEmitter.on('pause', () => store.dispatch('pauseAudio'));
    MPRISEmitter.on('next', () => {
        store.dispatch('playNextTrack');
        if (store.state.ui.radioMode === true) {
            const time = Math.trunc(document.querySelector('audio').currentTime * 1000);
            store.dispatch('skipRadio', { id: store.getters.playing.id, time });
        }
    });
    MPRISEmitter.on('prev', () => store.dispatch('playPreviousTrack'));
    MPRISEmitter.on('volume', volume => {
        let mute;
        if (store.state.ui.audioMute && volume > 0) {
            mute = false;
        }
        store.dispatch('setAudioVolume', { volume, mute });
    });
}

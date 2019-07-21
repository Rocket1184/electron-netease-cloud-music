import debug from 'debug';
import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';
import debounce from 'lodash/debounce';

import {
    UPDATE_PLAYING_URL,
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
 * Vuex mutation subscribe handler
 * @param {import('vuex').MutationPayload} mutation 
 * @param {import('@/store').State} state 
 */
function subscribeHandler(mutation, state) {
    const queue = state.ui.radioMode === true ? state.radio : state.playlist;
    const track = queue.list[queue.index];
    switch (mutation.type) {
        case UPDATE_PLAYING_URL:
        case RESTORE_PLAYLIST:
            if (track) {
                ipcSend('metadata', track);
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
            debounceVolume(mutation.payload.volume);
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
    MPRISEmitter.on('volume', volume => store.dispatch('setAudioVolume', { volume }));
}

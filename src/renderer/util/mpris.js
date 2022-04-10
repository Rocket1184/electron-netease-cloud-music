import debug from 'debug';
import debounce from 'lodash/debounce';
import { EventEmitter } from 'eventemitter3';

import { encm } from '@/util/globals';

import {
    SET_COVER_IMG_SRC,
    RESTORE_UI_STATE,
    RESTORE_PLAYLIST,
    SET_AUDIO_VOLUME,
    SET_AUDIO_PAUSED,
    SET_LOOP_MODE_LIST,
    SET_LOOP_MODE_SINGLE,
    SET_LOOP_MODE_RANDOM
} from '@/store/mutation-types';
import { LOOP_MODE } from '@/store/modules/playlist';

const MPRISEmitter = new EventEmitter();
const TAG = 'MPRIS:IPC';
const d = debug(TAG);

//          ipc                         PropertiesChanged signal
// Renderer --> Main(emit MPRIS events) -----------------------> DBus

encm.on(TAG, (event, type, id, ...args) => {
    d('🔻 %s %d %o', type, id, args);
    MPRISEmitter.emit(type, ...args);
});

function ipcSend(type, ...args) {
    encm.send(TAG, type, ...args);
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
}

const debounceVolume = debounce(volume => ipcSend('volume', volume), 100);

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

function sendLoopMode(mode) {
    let shuffle = false;
    let loop = 'Playlist';
    switch (mode) {
        case LOOP_MODE.LIST:
            shuffle = false;
            break;
        case LOOP_MODE.SINGLE:
            loop = 'Track';
            break;
        case LOOP_MODE.RANDOM:
            shuffle = true;
            break;
    }
    ipcSend('shuffle', shuffle);
    ipcSend('loop', loop);
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
            sendLoopMode(queue.loopMode);
            break;
        case SET_AUDIO_PAUSED:
            ipcSend(mutation.payload === true ? 'pause' : 'play');
            break;
        // since mpris is injected after Vue instance creation, it may not be
        // able to receive `RESTORE_UI_STATE` mutation. keep it here anyway.
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
        case SET_LOOP_MODE_LIST:
        case SET_LOOP_MODE_SINGLE:
        case SET_LOOP_MODE_RANDOM:
            sendLoopMode(queue.loopMode);
            break;
    }
}

/**
 * @param {import('@/store').Store} store 
 */
export function injectStore(store) {
    // ensure 'PlaybackStatus' is 'Stopped' when this module loads
    ipcSend('stop');
    // send volume once on inject
    ipcSend('volume', store.state.ui.audioVolume);
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
    MPRISEmitter.on('loop', loop => {
        switch (loop) {
            case 'None':
                // TODO: add 'None' loop mode
                store.commit(SET_LOOP_MODE_LIST);
                break;
            case 'Track':
                store.commit(SET_LOOP_MODE_SINGLE);
                break;
            case 'Playlist':
                store.commit(SET_LOOP_MODE_LIST);
                break;
        }
    });
    MPRISEmitter.on('shuffle', shuffle => {
        const { loopMode } = store.getters.queue;
        switch (shuffle) {
            case true:
                if (loopMode !== LOOP_MODE.RANDOM) {
                    store.commit(SET_LOOP_MODE_RANDOM);
                }
                break;
            case false:
                if (loopMode === LOOP_MODE.RANDOM) {
                    store.commit(SET_LOOP_MODE_LIST);
                }
                break;
        }
    });
}

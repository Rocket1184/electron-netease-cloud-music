import debug from 'debug';
import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';

import {
    UPDATE_PLAYING_URL,
    SET_AUDIO_PAUSED
} from '@/store/mutation-types';

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

//          ipc                         PropertiesChanged signal
// Renderer --> Main(emit MPRIS events) -----------------------> DBus
/**
 * @type {{[key: string]: Function}}
 */
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
 * bind audio element and MPRIS Emitter
 * @param {HTMLAudioElement} audioEl
 */
export function bindAudioElement(audioEl) {
    // TODO: check if listener exists before add
    audioEl.addEventListener('seeked', () => MPRIS.seeked(audioEl.currentTime));
    MPRISEmitter.on('position', (event, id, TrackId, Position) => {
        audioEl.currentTime = Position;
    });
    MPRISEmitter.on('seek', (event, id, Offset) => {
        audioEl.currentTime += Offset;
    });
    MPRISEmitter.on('stop', () => audioEl.currentTime = 0);
    senderFn('renderer-ready');
    // TODO: MPRIS `LoopStatus` and `Shuffle` support; which DE support those props?
}

// Vuex mutation subscribe handler
function subscribeHandler(mutation, state) {
    const queue = state.ui.radioMode === true ? state.radio : state.playlist;
    const track = queue.list[queue.index];
    switch (mutation.type) {
        case UPDATE_PLAYING_URL:
            if (track) {
                MPRIS.metadata(track);
            } else {
                MPRIS.metadata({});
                MPRIS.stop();
            }
            break;
        case SET_AUDIO_PAUSED:
            mutation.payload === true ? MPRIS.pause() : MPRIS.play();
            break;
    }
}

/**
 * @param {import('@/store').Store} store 
 */
export function injectStore(store) {
    // ensure 'PlaybackStatus' is 'Stopped' when this module loads
    MPRIS.stop();
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
}

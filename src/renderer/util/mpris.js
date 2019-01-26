import debug from 'debug';
import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';

import {
    UPDATE_PLAYING_URL,
    PAUSE_PLAYING_MUSIC,
    RESUME_PLAYING_MUSIC
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

//          ipc                         PropertiesChanged signal
// Renderer --> Main(emit MPRIS events) -----------------------> DBus
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
        'mpris:length': track.duration * 1e3,
        'mpris:artUrl': track.album.picUrl || 'file:///dev/null',
        'xesam:album': track.album.name || '未知专辑',
        'xesam:albumArtist': track.artists.map(ar => ar.name || '未知歌手'),
        'xesam:artist': track.artistName || '未知歌手',
        'xesam:discNumber': Number.parseInt(track.cd) || 1,
        'xesam:title': track.name || '未知歌曲',
        'xesam:tarckNumber': track.no || 0,
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
    MPRISEmitter.on('quit', () => ipcRenderer.send('quitApp'));
    MPRISEmitter.on('raise', () => ipcRenderer.send('focusApp'));
    if (audioEl) {
        audioEl.addEventListener('seeked', () => MPRIS.seeked(audioEl.currentTime));
        MPRISEmitter.on('getPosition', (_, id) => {
            senderFn('getPosition', id, audioEl.currentTime * 1e6);
        });
        MPRISEmitter.on('seek', (_, __, pos) => audioEl.currentTime = pos);
        MPRISEmitter.on('stop', () => {
            audioEl.pause();
            audioEl.currentTime = 0;
        });
        senderFn('renderer-ready');
    }
    // TODO: MPRIS `LoopStatus` and `Shuffle` support; which DE support those props?
}

// Vuex mutation subscribe handler
function subscribeHandler(mutation, state) {
    const track = state.playlist.list[state.playlist.index];
    switch (mutation.type) {
        case UPDATE_PLAYING_URL:
            MPRIS.metadata(getTrackMeta(track));
            break;
        case PAUSE_PLAYING_MUSIC:
            MPRIS.pause();
            break;
        case RESUME_PLAYING_MUSIC:
            MPRIS.play();
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

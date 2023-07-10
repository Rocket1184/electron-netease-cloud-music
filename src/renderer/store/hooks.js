import {
    SET_USER_SIGN_STATUS,
    SET_LOGIN_VALID,
    SET_AUDIO_PAUSED,
    SET_PLAY_LIST,
    CLEAR_PLAY_LIST,
    INSERT_TRACK_INTO_PLAYLIST,
    REMOVE_TRACK_FROM_PLAYLIST,
    CLEAR_RADIO,
    APPEND_RADIO,
    REMOVE_RADIO
} from './mutation-types';
import * as PlaylistDb from '@/api/database/playlist';
import * as RadioDb from '@/api/database/radio';

/**
 * @type {(() => void)[]}
 */
const unSubFns = [];
let signStatusTimeoutId = -1;

/**
 * @typedef {import('./modules/index').State} State
 * @typedef {import('vuex').Store<State>} Store
 * @typedef {import('vuex').MutationPayload} Mutation
 */

/**
 * @this {Store}
 * @param {Mutation} mutation
 * @param {State} state
 */
function autoUpdateSignStatus(mutation, state) {
    if (mutation.type === SET_USER_SIGN_STATUS) {
        if (signStatusTimeoutId < 0) {
            const time = new Date(state.user.signStatus.timestamp);
            const nextDue = new Date(state.user.signStatus.timestamp);
            if (time.getUTCHours() >= 16) {
                nextDue.setUTCDate(time.getUTCDate() + 1);
            }
            nextDue.setUTCHours(16, 0, 5, 0);
            const timeout = nextDue.getTime() - state.user.signStatus.timestamp;
            signStatusTimeoutId = setTimeout(() => {
                signStatusTimeoutId = -1;
                this.dispatch('updateUserSignStatus');
            }, timeout);
        }
    } else if (mutation.type === SET_LOGIN_VALID && mutation.payload === false && signStatusTimeoutId > 0) {
        clearTimeout(signStatusTimeoutId);
        signStatusTimeoutId = -1;
    }
}

/**
 * @this {Store}
 * @param {Mutation} mutation
 * @param {State} state
 */
function moreRadioSongs(mutation, state) {
    if (mutation.type === SET_AUDIO_PAUSED && mutation.payload === false) {
        const { list, index } = state.radio;
        if (state.ui.radioMode === true && list.length - 1 === index) {
            this.dispatch('getRadio');
        }
    }
}

/**
 * @this {Store}
 * @param {Mutation} mutation
 */
function updatePlaylistTable(mutation) {
    switch (mutation.type) {
        case CLEAR_PLAY_LIST:
            PlaylistDb.clear();
            break;
        case SET_PLAY_LIST:
            PlaylistDb.replace(mutation.payload);
            break;
        case INSERT_TRACK_INTO_PLAYLIST: {
            const { start, tracks } = mutation.payload;
            PlaylistDb.insert(start, tracks);
            break;
        }
        case REMOVE_TRACK_FROM_PLAYLIST: {
            const { start, count } = mutation.payload;
            PlaylistDb.remove(start, count);
            break;
        }
    }
}

/**
 * @this {Store}
 * @param {Mutation} mutation
 */
function updateRadioTable(mutation) {
    switch (mutation.type) {
        case CLEAR_RADIO:
            RadioDb.clear();
            break;
        case APPEND_RADIO:
            RadioDb.append(mutation.payload.tracks).then(() => RadioDb.trim());
            break;
        case REMOVE_RADIO:
            RadioDb.remove(mutation.payload.id);
            break;
    }
}

export function unsubscribeAll() {
    unSubFns.forEach(unSub => unSub());
    if (signStatusTimeoutId > 0) {
        clearTimeout(signStatusTimeoutId);
        signStatusTimeoutId = -1;
    }
    unSubFns.slice(0, 0);
}

/**
 * @param {Store} store 
 */
export function installHooks(store) {
    const subFns = [
        autoUpdateSignStatus,
        moreRadioSongs,
        updatePlaylistTable,
        updateRadioTable
    ];
    unSubFns.push.apply(unSubFns, subFns.map(subFn => store.subscribe(subFn.bind(store))));
}

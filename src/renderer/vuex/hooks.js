import {
    SET_USER_SIGN_STATUS,
    SET_AUDIO_PAUSED
} from './mutation-types';

/**
 * @type {(() => void)[]}
 */
const unSubFns = [];
let signStatusTimeoutId = -1;

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
    }
}

function moreRadioSongs(mutation, state) {
    if (mutation.type === SET_AUDIO_PAUSED && mutation.payload === false) {
        const { list, index } = state.radio;
        if (state.ui.radioMode === true && list.length - 1 === index) {
            this.dispatch('getRadio');
        }
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
 * @param {import('node_modules/vuex/types/index').Store} store 
 */
export function installHooks(store) {
    const subFns = [
        autoUpdateSignStatus,
        moreRadioSongs
    ];
    unSubFns.push.apply(unSubFns, subFns.map(subFn => store.subscribe(subFn.bind(store))));
}

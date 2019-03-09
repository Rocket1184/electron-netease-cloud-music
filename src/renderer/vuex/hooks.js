import {
    SET_USER_SIGN_STATUS,
    SET_AUDIO_PAUSED
} from './mutation-types';

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

export default function (store) {
    store.subscribe(autoUpdateSignStatus.bind(store));
    store.subscribe(moreRadioSongs.bind(store));
}

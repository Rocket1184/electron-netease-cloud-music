import { RESUME_PLAYING_MUSIC } from './mutation-types';

async function moreRadioSongs(mutation, state) {
    if (mutation.type === RESUME_PLAYING_MUSIC) {
        const { list, index } = state.radio;
        if (state.ui.radioMode === true && list.length - 1 === index) {
            this.dispatch('getRadio');
        }
    }
}

export default function (store) {
    store.subscribe(moreRadioSongs.bind(store));
}

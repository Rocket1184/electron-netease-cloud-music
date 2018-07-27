import * as types from '../mutation-types';
import ApiRenderer from '@/util/apiRenderer';

let state = window.__NCM_SETTINGS__ || {
    bitRate: 'l',
    windowBorder: true,
    autoPlay: false,
    themePrimaryColor: '#7e57c2',
    themeSecondaryColor: '#ff4081',
    themeVariety: 'light'
};

const mutations = {
    [types.UPDATE_SETTINGS](state, payload) {
        if (state._updated === false) {
            state._updated = true;
        }
        state.bitRate = payload.bitRate;
        state.windowBorder = payload.windowBorder;
        state.autoPlay = payload.autoPlay;
    },
    [types.WRITE_SETTINGS](state) {
        ApiRenderer.writeSettings(state);
    }
};

export default {
    state,
    mutations
};

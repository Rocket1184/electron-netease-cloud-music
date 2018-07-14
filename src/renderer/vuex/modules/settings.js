import * as types from '../mutation-types';
import ApiRenderer from '@/util/apiRenderer';

let state = {
    bitRate: 'l',
    windowBorder: false,
    autoPlay: false
};

const mutations = {
    [types.UPDATE_SETTINGS](state, payload) {
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

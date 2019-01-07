import * as types from '../mutation-types';
import Api from '@/util/api';

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
        Reflect.ownKeys(payload).forEach(key => {
            state[key] = payload[key];
        });
    },
    [types.WRITE_SETTINGS](state) {
        Api.writeSettings(state);
    }
};

export default {
    state,
    mutations
};

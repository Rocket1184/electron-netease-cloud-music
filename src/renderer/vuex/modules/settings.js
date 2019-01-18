import * as types from '../mutation-types';

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
    }
};

export default {
    state,
    mutations
};

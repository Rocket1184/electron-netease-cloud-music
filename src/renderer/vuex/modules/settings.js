import * as types from '../mutation-types';
let state;

try {
    const str = sessionStorage.getItem('settings');
    if (str) {
        state = JSON.parse(str);
    }
} catch (e) {
    sessionStorage.removeItem('settings');
    state = {
        autoSign: false,
        bitRate: 'l',
        windowBorder: true,
        windowZoom: null,
        showTrayIcon: false,
        trayIconVariety: 'light',
        exitOnWindowClose: true,
        themePrimaryColor: '#7e57c2',
        themeSecondaryColor: '#ff4081',
        themeVariety: 'light'
    };
}

const mutations = {
    [types.UPDATE_SETTINGS](state, payload) {
        Object.entries(payload).forEach(([key, val]) => state[key] = val);
    }
};

export default {
    state,
    mutations
};

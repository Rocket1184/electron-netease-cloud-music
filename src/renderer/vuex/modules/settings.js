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
        bitRate: 'l',
        windowBorder: true,
        windowZoom: null,
        showTrayIcon: true,
        trayIconVariety: 'light',
        exitOnWindowClose: true,
        themePrimaryColor: '#7e57c2',
        themeSecondaryColor: '#ff4081',
        themeVariety: 'light'
    };
}

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

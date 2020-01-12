import * as types from '../mutation-types';

const DefaultSettings = {
    autoPlay: false,
    autoSign: false,
    /** @type {Types.MusicQuality} */
    // @ts-ignore
    bitRate: 'l',
    filterRcmd: false,
    windowBorder: true,
    windowZoom: null,
    showTrayIcon: false,
    trayIconVariety: 'light',
    exitOnWindowClose: true,
    themePrimaryColor: '#7e57c2',
    themeSecondaryColor: '#ff4081',
    themeVariety: 'light'
};

/**
 * @typedef {typeof DefaultSettings} State
 * @type {State}
 */
let state;

try {
    const str = sessionStorage.getItem('settings');
    if (str) {
        state = JSON.parse(str);
    }
} catch (e) {
    sessionStorage.removeItem('settings');
    state = Object.assign({}, DefaultSettings);
}

/**
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
    [types.UPDATE_SETTINGS](state, /** @type {Partial<State>} */ payload) {
        Object.entries(payload).forEach(([key, val]) => state[key] = val);
    }
};

export default {
    state,
    mutations
};

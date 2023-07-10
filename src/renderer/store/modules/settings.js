import * as types from '../mutation-types';

const DefaultSettings = {
    autoPlay: false,
    autoSign: false,
    bitRate: 'l',
    bitRateDownload: 'ex',
    filterRcmd: false,
    startupPage: 'index',
    windowBorder: true,
    windowZoom: null,
    showTrayIcon: false,
    trayIconVariety: 'light',
    exitOnWindowClose: true,
    minimizeOnStartup: false,
    themePrimaryColor: '#7e57c2',
    themeSecondaryColor: '#ff4081',
    themeVariety: 'auto',
    autoReplacePlaylist: false,
    lyricTranslation: 'translation',
    titleBarShowsTrackName: true
};

/**
 * @typedef {typeof DefaultSettings} State
 * @type {State}
 */
const state = Object.assign({}, DefaultSettings);

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

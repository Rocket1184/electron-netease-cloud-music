import MuseUI from 'muse-ui';

const overrides = {
    divider: 'rgba(0,0,0,.2)'
};

/**
 * add app specific theme variable, then set theme color
 * @param {any} theme theme option
 * @param {string} extendName theme name to extend
 */
export function initTheme(theme, extendName) {
    MuseUI.theme.addCreateTheme((theme) => {
        return `
.player-bar,.ncm-page{background-color:${theme.background.default}}
.action-item:hover .mu-icon{color:${theme.background.default}}
`.trim();
    });
    setTheme(theme, extendName);
}

/**
 * set MuseUI theme color
 * @param {any} theme theme option
 * @param {string} extendName theme name to extend
 */
export function setTheme(theme, extendName) {
    const id = 'ncm';
    MuseUI.theme.add(id, { ...overrides, ...theme }, extendName).use(id);
}

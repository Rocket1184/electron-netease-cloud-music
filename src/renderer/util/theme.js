import MuseUI from 'muse-ui';

const overrides = {
    divider: 'rgba(0,0,0,.1)'
};

/**
 * add app specific theme variable, then set theme color
 * @param {any} theme theme option
 * @param {string} extendName theme name to extend
 */
export function initTheme(theme, extendName) {
    MuseUI.theme.addCreateTheme((theme) => {
        return `body{
--primary-color:${theme.primary};
--accent-color:${theme.secondary};
--text-color:${theme.text.primary};
--secondary-text-color:${theme.text.secondary};
--hint-text-color:${theme.text.hint};
--background-color:${theme.background.default};
}`;
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

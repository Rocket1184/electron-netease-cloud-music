import MuseUI from 'muse-ui';

const overrides = {
    divider: 'rgba(0,0,0,.2)'
};

export function initTheme(...args) {
    MuseUI.theme.addCreateTheme((theme) => {
        return `
.ncm-page{background-color:${theme.background.default}}
.action-item:hover .mu-icon{color:${theme.background.default}}
`.trim();
    });
    setTheme(...args);
}

export function setTheme(theme, extendName) {
    const id = 'ncm';
    MuseUI.theme.add(id, { ...overrides, ...theme }, extendName).use(id);
}

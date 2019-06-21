'use strict';

// 'debug' TAG
process.env.DEBUG = [
    'MusicServer',
    'API',
    'MPRIS',
    'MPRIS:IPC',
    'HTTP',
    'Tray',
    'Tray:IPC'
].join(',');
process.env.DEBUG_COLORS = 'true';
process.env.NODE_ENV = 'development';
require('@babel/register')({
    babelrc: false,
    sourceMaps: 'inline',
    only: [/src\/main\//],
    plugins: [
        '@babel/plugin-transform-modules-commonjs'
    ]
});

const { app } = require('electron');
const { devPort, version } = require('../../script/config');

// Install `vue-devtools`
app.on('ready', () => {
    const { default: install, VUEJS_DEVTOOLS } = require('electron-devtools-installer');
    // eslint-disable-next-line no-console
    install(VUEJS_DEVTOOLS.id).catch(console.log);
});

// @ts-ignore App version (non-public api)
app.setVersion(version);

// BrowserWindow URL
process.env.MAIN_URL = `http://localhost:${devPort}`;

// Require `main` process to boot app
require('./index');

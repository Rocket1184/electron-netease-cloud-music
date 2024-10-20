'use strict';

const srcMainDir = __dirname;

// 'debug' TAG
process.env.DEBUG = [
    'MusicServer',
    'API',
    'MPRIS',
    'MPRIS:IPC',
    'HTTP',
    'Downloader',
    'Tray'
].join(',');
process.env.DEBUG_COLORS = 'true';
process.env.NODE_ENV = 'development';
require('@babel/register')({
    babelrc: false,
    sourceMaps: 'inline',
    only: [
        (filename) => filename.startsWith(srcMainDir)
    ],
    plugins: [
        '@babel/plugin-transform-class-properties',
        '@babel/plugin-transform-modules-commonjs',
        ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }]
    ]
});

const { app } = require('electron');
const { devPort, version } = require('../../script/config');

// Install `vue-devtools`
app.on('ready', () => {
    const { installExtension, VUEJS_DEVTOOLS } = require('@tomjs/electron-devtools-installer');
    // eslint-disable-next-line no-console
    installExtension(VUEJS_DEVTOOLS).catch(console.log);
});

// App version (non-public api)
app.setVersion(version);

// BrowserWindow URL
process.env.MAIN_URL = `http://localhost:${devPort}`;

// Require `main` process to boot app
require('./index');

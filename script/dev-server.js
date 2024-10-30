'use strict';

process.env.NODE_ENV = 'development';

const { exec } = require('node:child_process');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const { absPath } = require('./util');
const config = require('./config');

/* eslint-disable no-console */

// Press Ctrl-C to exit
process.on('SIGINT', () => {
    console.log('\nCtrl-C Pressed. Exiting...\n');
    electron.kill();
    process.exit(0);
});

const electron = exec([
    'electron',
    '--ozone-platform-hint=auto',
    '--enable-wayland-ime',
    absPath('/src/main/index.dev.js'),
    '--inspect=5858',
    '--remote-debugging-port=5959'
].join(' '));

electron.stdout.pipe(process.stdout);
electron.stderr.pipe(process.stderr);
// terminate webpack-dev-server when Electron closed
electron.on('close', code => {
    console.log('\nElectron closed. Exiting...');
    process.exit(code);
});

// renderer webpack config
const compileCfg = require('./webpack.config.renderer');

/** @type {import('webpack-dev-server').Configuration} */
const wdsConf = {
    hot: true,
    liveReload: false,
    port: config.devPort,
    client: {
        overlay: true
    }
};

new WebpackDevServer(wdsConf, webpack(compileCfg)).start();

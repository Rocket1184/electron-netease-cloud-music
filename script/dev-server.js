'use strict';

const { exec } = require('child_process');
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

const electron = exec(`electron ${absPath('/src/main/index.dev.js')}`);

electron.stdout.pipe(process.stdout);
electron.stderr.pipe(process.stderr);
// terminate webpack-dev-server when Electron closed
electron.on('close', code => {
    console.log('\nElectron closed. Exiting...');
    process.exit(code);
});

// webpack config
const compileCfg = require('./webpack.config.renderer');

// webpack-dev-server option
const devServerOpt = {
    // `hot` must be true when using HMR
    hot: true,
    stats: 'minimal',
    // `host` and `port` must be specified when using `addDevServerEntrypoints`
    // see https://github.com/webpack/webpack-dev-server/blob/v3.1.1/lib/util/createDomain.js
    host: 'localhost',
    port: config.devPort,
    overlay: true
};

// enable HMR.
// see https://webpack.js.org/guides/hot-module-replacement/#via-the-node-js-api
WebpackDevServer.addDevServerEntrypoints(compileCfg, devServerOpt);
compileCfg.plugins.push(new webpack.HotModuleReplacementPlugin());

const compiler = webpack(compileCfg);

const devServer = new WebpackDevServer(compiler, devServerOpt);
devServer.listen(config.devPort);

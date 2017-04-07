const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const projectCfg = require('./config');
const projectRoot = path.resolve('.');

require('child_process').exec(`electron ${projectRoot}/app/src/main/index.dev.js`);

const compileCfg = require('./webpack.config.renderer');
const compiler = webpack(compileCfg);
const devServer = new WebpackDevServer(compiler);
devServer.listen(projectCfg.devPort);

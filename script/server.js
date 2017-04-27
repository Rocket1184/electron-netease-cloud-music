const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const projectCfg = require('./config');
const projectRoot = path.resolve('.');

const mainProcess = require('child_process').exec(`electron ${projectRoot}/app/src/main/index.dev.js`);
mainProcess.stdout.on('data', console.log);

let compileCfg = require('./webpack.config.renderer');
compileCfg.entry.renderer.unshift(
    `webpack-dev-server/client?http://localhost:${projectCfg.devPort}/`,
    'webpack/hot/dev-server'
);
compileCfg.plugins.push(
    new webpack.HotModuleReplacementPlugin()
);
const compiler = webpack(compileCfg);

const serverCfg = {
    hot: true,
    stats: 'minimal',
    overlay: true,
    contentBase: path.resolve(projectRoot, 'app/dist')
};

const devServer = new WebpackDevServer(compiler, serverCfg);
devServer.listen(projectCfg.devPort);

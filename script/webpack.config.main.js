'use strict';

const path = require('path');
const packageJson = require('../app/package.json');
const BabiliPlugin = require('babili-webpack-plugin');

const projectRoot = path.resolve('.');

let cfg = {
    context: path.join(projectRoot, 'app/src'),
    target: 'electron',
    devtool: 'source-map',
    externals: Object.keys(packageJson.dependencies),
    entry: {
        main: path.join(projectRoot, 'app/src/main/index.js')
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(projectRoot, 'app/dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [],
    node: {
        __dirname: false,
        __filename: false
    },
    resolve: {
        modules: [
            path.join(projectRoot, 'app/node_modules')
        ]
    }
};

if (process.env.NODE_ENV === 'production') {
    cfg.plugins.push(
        new BabiliPlugin()
    );
}

module.exports = cfg;

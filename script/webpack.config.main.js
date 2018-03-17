'use strict';

const webpack = require('webpack');
const packageJson = require('../package.json');
const BabelMinifyPlugin = require('babel-minify-webpack-plugin');

const { absPath } = require('./util');

let cfg = {
    mode: process.env.NODE_ENV || 'development',
    performance: { hints: false },
    context: absPath('src/main'),
    target: 'electron-main',
    entry: {
        main: './index.js'
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: absPath('dist')
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
    }
};

if (process.env.NODE_ENV === 'production') {
    // release config
    cfg.plugins.push(
        new BabelMinifyPlugin(),
        new webpack.DefinePlugin({ 'process.env.NODE_ENV': `"production"` })
    );
} else {
    // dev config
    cfg.devtool = 'cheap-module-source-map';
    cfg.externals = Object.keys(packageJson.dependencies);
    cfg.resolve.modules = [
        absPath('node_modules')
    ];
}

module.exports = cfg;

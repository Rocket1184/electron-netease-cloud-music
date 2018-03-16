'use strict';

const path = require('path');
const webpack = require('webpack');
const packageJson = require('../package.json');
const BabelMinifyPlugin = require('babel-minify-webpack-plugin');

const projectRoot = path.resolve('.');

let cfg = {
    mode: process.env.NODE_ENV || 'development',
    performance: { hints: false },
    context: path.join(projectRoot, 'src'),
    target: 'electron-main',
    entry: {
        main: path.join(projectRoot, 'src/main/index.js')
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(projectRoot, 'dist')
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
        new webpack.DefinePlugin({
            PRODUCTION: 'true',
            'process.env': {
                NODE_ENV: '"production"'
            }
        })
    );
} else {
    // dev config
    cfg.devtool = 'eval';
    cfg.externals = Object.keys(packageJson.dependencies);
    cfg.resolve.modules = [
        path.join(projectRoot, 'node_modules')
    ];
}

module.exports = cfg;

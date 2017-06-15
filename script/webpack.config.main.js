'use strict';

const path = require('path');
const webpack = require('webpack');
const packageJson = require('../package.json');
const BabiliPlugin = require('babili-webpack-plugin');

const projectRoot = path.resolve('.');

let cfg = {
    context: path.join(projectRoot, 'src'),
    target: 'electron',
    devtool: 'source-map',
    externals: Object.keys(packageJson.dependencies),
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
    },
    resolve: {
        modules: [
            path.join(projectRoot, 'node_modules')
        ]
    }
};

if (process.env.NODE_ENV === 'production') {
    delete cfg.externals;
    delete cfg.resolve.modules;
    cfg.plugins.push(
        new BabiliPlugin(),
        new webpack.DefinePlugin({
            PRODUCTION: 'true',
            'process.env': {
                NODE_ENV: '"production"'
            }
        })
    );
}

module.exports = cfg;

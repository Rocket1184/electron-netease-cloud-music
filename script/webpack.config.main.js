'use strict';

const path = require('path');
const packageJson = require('../app/package.json');

const projectRoot = path.resolve('.');

module.exports = {
    context: path.join(projectRoot, 'app/src'),
    target: 'electron',
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

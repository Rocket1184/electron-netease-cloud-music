'use strict';

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const { isProd, absPath } = require('./util');
const packageJson = require('../package.json');

/** @type {import('webpack').Configuration} */
let cfg = {
    performance: { hints: false },
    target: 'electron-main',
    entry: {
        main: absPath('src/main/index.js')
    },
    output: {
        filename: '[name].js',
        path: absPath('dist')
    },
    module: {
        rules: [
            {
                resource: path => path.includes('src/main') && path.endsWith('.js'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }]
                        ]
                    }
                }
            }
        ]
    },
    resolve: {
        alias: {
            'jsbi':  'jsbi/dist/jsbi-cjs.js'
        }
    },
    node: {
        __dirname: false,
        __filename: false
    }
};

if (isProd) {
    // release config
    cfg.mode = 'production';
    cfg.devtool = 'source-map';
    cfg.plugins = [
        new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
        new webpack.DefinePlugin({ 'process.env.MAIN_URL': '`file://${__dirname}/index.html`' }),
        new CopyWebpackPlugin([
            { from: absPath('package.json'), to: absPath('dist') },
            { from: absPath('src/main/preload.prod.js'), to: absPath('dist/preload.js') },
            {
                from: { glob: absPath('assets/icons/tray*.png') },
                to: absPath('dist/icons/[name].[ext]'),
                toType: 'template'
            },
        ])
    ];
} else {
    // dev config
    cfg.mode = 'development';
    cfg.devtool = 'cheap-module-eval-source-map';
    cfg.externals = Object.keys(packageJson.dependencies);
    cfg.resolve = {
        modules: [
            absPath('node_modules')
        ]
    };
}

module.exports = cfg;

'use strict';

const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

const config = require('./config');
const { isProd, absPath } = require('./util');
const packageJson = require('../package.json');

/** @type {import('webpack').Configuration} */
let cfg = {
    performance: { hints: false },
    context: absPath('src/renderer'),
    target: 'electron-renderer',
    entry: {
        renderer: [
            './main.js'
        ]
    },
    output: {
        filename: '[name].js',
        path: absPath('dist'),
        // https://github.com/webpack/webpack/issues/6642
        globalObject: 'this'
    },
    module: {
        rules: [
            {
                test: /worker\.js$/,
                use: {
                    loader: 'worker-loader'
                }
            },
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader',
                    options: {
                        compilerOptions: { preserveWhitespace: false }
                    }
                },
            },
            {
                test: /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'imgs/[name].[ext]',
                        esModule: false
                    }
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'fonts/[name].[ext]'
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            title: config.productName
        }),
        new VueLoaderPlugin()
    ],
    resolve: {
        alias: {
            'muse-ui': '@rocka/muse-ui',
            'assets': absPath('assets'),
            '@': absPath('src/renderer')
        }
    }
};

if (isProd) {
    // release config
    cfg.mode = 'production';
    cfg.devtool = 'source-map';
    cfg.module.rules.push(
        {
            test: /\.css$/,
            use: [
                { loader: MiniCSSExtractPlugin.loader },
                { loader: 'css-loader' },
                { loader: 'clean-css-loader', options: { level: 2 } }
            ]
        },
        {
            test: /\.less$/,
            use: [
                { loader: MiniCSSExtractPlugin.loader },
                { loader: 'css-loader' },
                { loader: 'clean-css-loader', options: { level: 2 } },
                { loader: 'less-loader' }
            ]
        }
    );
    // what a heck!
    // ref: https://github.com/jantimon/html-webpack-plugin/blob/v3.2.0/index.js#L34
    // ref: https://github.com/jantimon/html-webpack-plugin/blob/v3.2.0/index.js#L479
    cfg.plugins.find(p => p instanceof HtmlWebpackPlugin).options.meta = [{
        'http-equiv': 'Content-Security-Policy',
        content: `script-src 'self'; media-src http://localhost:* https://*.vod.126.net; img-src 'self' https://*.music.126.net https://music.163.com`
    }];
    cfg.plugins.push(
        new MiniCSSExtractPlugin()
    );
} else {
    // dev config
    cfg.mode = 'development';
    cfg.module.rules.push(
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
        { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] }
    );
    cfg.devtool = 'cheap-module-eval-source-map';
    cfg.output.libraryTarget = 'commonjs2';
    cfg.externals = Object.keys(packageJson.dependencies);
    cfg.resolve.modules = [
        absPath('node_modules')
    ];
}

module.exports = cfg;

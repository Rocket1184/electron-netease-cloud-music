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
        publicPath: ''
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader',
                    options: {
                        compilerOptions: { whitespace: 'condense' }
                    }
                },
            },
            {
                test: /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/,
                type: 'asset/resource',
                generator: {
                    filename: 'imgs/[name][ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name][ext]'
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
    // https://github.com/jantimon/html-webpack-plugin/blob/v4.5.0/index.js#L74
    // https://github.com/jantimon/html-webpack-plugin/blob/v4.5.0/index.js#L766
    cfg.plugins.find(p => p instanceof HtmlWebpackPlugin).userOptions.meta = {
        viewport: false,
        csp: {
            'http-equiv': 'Content-Security-Policy',
            content: `script-src 'self'; media-src http://localhost:* https://*.vod.126.net; img-src 'self' https://*.music.126.net https://music.163.com`
        }
    };
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
    cfg.devtool = 'eval-cheap-module-source-map';
    cfg.output.libraryTarget = 'commonjs2';
    cfg.externals = Object.keys(packageJson.dependencies).filter(i => i !== 'dexie');
    cfg.resolve.modules = [
        absPath('node_modules')
    ];
}

module.exports = cfg;

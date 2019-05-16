'use strict';

const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
        path: absPath('dist')
    },
    module: {
        rules: [
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
                    query: {
                        name: 'imgs/[name].[ext]'
                    }
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: {
                    loader: 'file-loader',
                    query: {
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
            'assets': absPath('assets'),
            '@': absPath('src/renderer')
        }
    }
};

/** @type {import('webpack').Configuration} */
let cfgWorker = {
    context: absPath('src/renderer'),
    target: 'electron-renderer',
    entry: {
        worker: [
            './worker/worker.js'
        ]
    },
    output: {
        filename: '[name].js',
        path: absPath('dist'),
        globalObject: 'this'
    },
    resolve: {
        alias: {
            'assets': absPath('assets'),
            '@': absPath('src/renderer')
        }
    }
};

if (isProd) {
    // release config
    cfg.mode = 'production';
    const CleanCSSPlugin = require('less-plugin-clean-css');
    cfg.devtool = 'source-map';
    cfg.module.rules.push(
        {
            test: /\.css$/,
            use: [
                { loader: MiniCSSExtractPlugin.loader },
                { loader: 'css-loader' }
            ]
        },
        {
            test: /\.less$/,
            use: [
                { loader: MiniCSSExtractPlugin.loader },
                { loader: 'css-loader' },
                {
                    loader: 'less-loader',
                    options: { plugins: [new CleanCSSPlugin({ level: 2 })] }
                }
            ]
        }
    );
    // what a heck!
    // ref: https://github.com/jantimon/html-webpack-plugin/blob/v3.2.0/index.js#L34
    // ref: https://github.com/jantimon/html-webpack-plugin/blob/v3.2.0/index.js#L479
    cfg.plugins.find(p => p instanceof HtmlWebpackPlugin).options.meta = [{
        'http-equiv': 'Content-Security-Policy',
        content: `script-src 'self'; media-src http://localhost:* https://*.vod.126.net; img-src 'self' https://*.music.126.net`
    }];
    cfg.plugins.push(
        new MiniCSSExtractPlugin(),
        new CopyWebpackPlugin([
            { from: absPath('src/renderer/login.html'), to: absPath('dist') }
        ])
    );
    // worker
    cfgWorker.mode = 'production';
    cfgWorker.devtool = 'source-map';
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
    // worker
    cfgWorker.mode = 'development';
    cfgWorker.devtool = 'cheap-module-eval-source-map';
}

module.exports = [cfg, cfgWorker];

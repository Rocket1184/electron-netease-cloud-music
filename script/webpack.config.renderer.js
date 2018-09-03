'use strict';

const webpack = require('webpack');
const packageJson = require('../package.json');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

const { isProd, absPath } = require('./util');

let cfg = {
    mode: process.env.NODE_ENV || 'development',
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
            template: absPath('src/renderer/index.ejs')
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

if (isProd) {
    // release config
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
    cfg.plugins.push(
        new MiniCSSExtractPlugin(),
        new CopyWebpackPlugin([
            { from: absPath('package.json'), to: absPath('dist') },
            { from: absPath('src/renderer/login.html'), to: absPath('dist') },
            { from: absPath('src/main/preload.prod.js'), to: absPath('dist/preload.js') }
        ]),
        new webpack.DefinePlugin({ 'process.env.NODE_ENV': `"production"` })
    );
} else {
    // dev config
    cfg.module.rules.push(
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
        { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] }
    );
    cfg.devtool = 'cheap-module-source-map';
    cfg.output.libraryTarget = 'commonjs2';
    cfg.externals = Object.keys(packageJson.dependencies);
    cfg.resolve.modules = [
        absPath('node_modules')
    ];
}

module.exports = cfg;

'use strict';

const webpack = require('webpack');
const packageJson = require('../package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BabelMinifyPlugin = require('babel-minify-webpack-plugin');

const { absPath } = require('./util');

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
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.json$/,
                use: 'json-loader'
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {}
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
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
        new ExtractTextPlugin('styles.css'),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: absPath('src/renderer/index.ejs')
        }),
    ],
    resolve: {
        alias: {
            'assets': absPath('assets'),
            '@': absPath('src/renderer')
        }
    }
};

if (process.env.NODE_ENV === 'production') {
    // release config
    /**
     * disable source map for now.
     * see: https://github.com/mozilla/source-map/issues/304
     */
    // cfg.devtool = 'source-map';
    cfg.module.rules.map(e => {
        if (e.loader === 'vue-loader') {
            e.options.extractCSS = true;
        }
    });
    cfg.plugins.push(
        new CopyWebpackPlugin([
            { from: absPath('package.json'), to: absPath('dist') },
            { from: absPath('src/renderer/login.html'), to: absPath('dist') },
            { from: absPath('src/main/preload.prod.js'), to: absPath('dist/preload.js') }
        ]),
        new BabelMinifyPlugin(),
        new webpack.DefinePlugin({ 'process.env.NODE_ENV': `"production"` })
    );
} else {
    // dev config
    cfg.devtool = 'cheap-module-source-map';
    cfg.output.libraryTarget = 'commonjs2';
    cfg.externals = Object.keys(packageJson.dependencies);
    cfg.resolve.modules = [
        absPath('node_modules')
    ];
}

module.exports = cfg;

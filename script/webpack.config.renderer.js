'use strict';

const path = require('path');
const packageJson = require('../app/package.json');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BabiliPlugin = require('babili-webpack-plugin');

const projectRoot = path.resolve('.');

let cfg = {
    context: path.join(projectRoot, 'app/src'),
    target: 'electron-renderer',
    devtool: 'source-map',
    externals: Object.keys(packageJson.dependencies),
    entry: {
        renderer: [
            path.join(projectRoot, 'app/src/renderer/main.js')
        ]
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(projectRoot, 'app/dist')
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
                test: /\.html$/,
                use: 'vue-html-loader'
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
                use: 'vue-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    query: {
                        limit: 10000,
                        name: 'imgs/[name].[ext]'
                    }
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    query: {
                        limit: 10000,
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
            template: path.join(projectRoot, 'app/index.ejs'),
            appModules: process.env.NODE_ENV !== 'production'
                ? path.join(projectRoot, 'app/node_modules')
                : false
        })
    ],
    resolve: {
        extensions: ['.js', '.vue', '.json', '.css', '.node'],
        modules: [
            path.join(projectRoot, 'node_modules'),
            path.join(projectRoot, 'app/node_modules')
        ]
    }
};

if (process.env.NODE_ENV === 'production') {
    cfg.plugins.push(
        new BabiliPlugin()
    );
}

module.exports = cfg;

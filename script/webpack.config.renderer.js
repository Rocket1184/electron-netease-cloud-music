'use strict';

const path = require('path');
const webpack = require('webpack');
const packageJson = require('../package.json');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BabiliPlugin = require('babili-webpack-plugin');

const projectRoot = path.resolve('.');

let cfg = {
    context: projectRoot,
    target: 'electron-renderer',
    entry: {
        renderer: [
            path.join(projectRoot, 'src/renderer/main.js')
        ]
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(projectRoot, 'dist')
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
                loader: 'vue-loader',
                options: {
                    extractCSS: true,
                }
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
        new ExtractTextPlugin('styles.css')
    ],
    resolve: {
        extensions: ['.js', '.vue', '.json', '.css', '.node']
    }
};

if (process.env.NODE_ENV === 'production') {
    // release config
    cfg.plugins.push(
        new BabiliPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(projectRoot, 'src/renderer/index.ejs')
        }),
        new webpack.DefinePlugin({
            PRODUCTION: 'true',
            'process.env': {
                NODE_ENV: '"production"'
            }
        })
    );
} else {
    // dev config
    cfg.devtool = 'cheap-module-eval-source-map';
    cfg.externals = Object.keys(packageJson.dependencies);
    cfg.resolve.modules = [
        path.join(projectRoot, 'node_modules')
    ];
    cfg.plugins.push(
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(projectRoot, 'src/renderer/index.ejs'),
            appModules: path.join(projectRoot, 'node_modules')
        }),
        new webpack.DefinePlugin({
            PRODUCTION: 'false'
        })
    );
}

module.exports = cfg;

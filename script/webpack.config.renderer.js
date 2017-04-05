'use strict';

const path = require('path');
const packageJson = require('../app/package.json');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const projectRoot = path.resolve('.');

module.exports = {
    context: path.join(projectRoot, 'app'),
    target: 'electron-renderer',
    externals: Object.keys(packageJson.dependencies),
    entry: {
        renderer: path.join(projectRoot, 'app/src/renderer/main.js')
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
                options: {
                    plugins: [
                        'syntax-object-rest-spread',
                        'transform-object-rest-spread',
                        'transform-es2015-modules-commonjs'
                    ]
                },
                exclude: /node_modules/
            },
            {
                test: /\.json$/,
                use: 'json-loader'
            },
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
                            scss: 'vue-style-loader!css-loader!sass-loader'
                        }
                    }
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
        new ExtractTextPlugin('styles.css'),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './index.ejs',
            appModules: false
        })
    ],
    resolve: {
        extensions: ['.js', '.vue', '.json', '.css', '.node'],
        modules: [
            path.join(projectRoot, 'app/node_modules')
        ]
    },
};

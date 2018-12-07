'use strict';

const packageJson = require('../package.json');

const { isProd, absPath } = require('./util');

let cfg = {
    performance: { hints: false },
    context: absPath('src/main'),
    target: 'electron-main',
    entry: {
        main: './index.js'
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: absPath('dist')
    },
    module: {
        rules: [
            {
                test: /\.node$/,
                use: 'native-ext-loader'
            }
        ]
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

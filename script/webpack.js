'use strict';

process.env.NODE_ENV = 'production';

const webpack = require('webpack');

const { absPath, removeKeepDot } = require('./util');

let argv = process.argv.slice(2);
if (!argv.length) argv = ['main', 'renderer'];

/* eslint-disable no-console */

if (argv[0] === 'clean') {
    removeKeepDot(absPath('dist'));
    process.exit(0);
}

let webpackCfg = [];
if (argv.includes('main')) webpackCfg.push(require('./webpack.config.main'));
if (argv.includes('renderer')) webpackCfg.push(require('./webpack.config.renderer'));

if (!webpackCfg.length) {
    console.error('No pack target specified.');
    console.log('Expected "main" or "renderer"\n');
    process.exit(1);
}

/** @type {import('webpack').Stats.ToStringOptions} */
const toStrOpt = {
    all: undefined,
    errorDetails: true,
    env: true,
    hash: false,
    builtAt: false,
    colors: true,
    modules: false,
    entrypoints: false,
    performance: false
};

webpack(webpackCfg, (err, stats) => {
    if (err) throw err;
    else if (stats.hasErrors()) {
        process.stderr.write(stats.toString(toStrOpt));
        console.log(`'\n\nError when packing ${argv.join(', ')}.`);
        process.exit(1);
    } else {
        process.stdout.write(stats.toString(toStrOpt));
        console.log(`'\n\nPack for ${argv.join(', ')} succeed.`);
        process.exit(0);
    }
});

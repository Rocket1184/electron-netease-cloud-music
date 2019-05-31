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
    console.error('No dist target, expected "main" or "renderer"');
    process.exit(1);
}

/** @type {import('webpack').Stats.ToStringOptions} */
const toStrOpt = {
    all: false,
    assets: true,
    colors: true,
    errors: true,
    timings: true,
    version: true
};

webpack(webpackCfg, (err, stats) => {
    if (err) throw err;
    else if (stats.hasErrors()) {
        process.stderr.write(stats.toString(toStrOpt));
        console.log(`'\n\nError when bundling ${argv.join(', ')}.`);
        process.exit(1);
    } else {
        process.stdout.write(stats.toString(toStrOpt));
        console.log(`'\n\nModule ${argv.join(', ')} bundled successfully.`);
        process.exit(0);
    }
});

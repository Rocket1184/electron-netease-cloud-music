'use strict';

process.env.NODE_ENV = 'production';

const webpack = require('webpack');

const { absPath, removeRecursive } = require('./util');

let argv = process.argv.slice(2);
if (!argv.length) argv = ['main', 'renderer'];

/* eslint-disable no-console */

if (argv[0] === 'clean') {
    removeRecursive(absPath('dist'));
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

/**
 * @param {import('webpack').Configuration} cfg
 * @returns {import('webpack').Stats}
 */
function webpackCompile(cfg) {
    return new Promise((resolve, reject) => {
        webpack(cfg, (err, stats) => {
            if (err) {
                reject(err);
            } else if (stats.hasErrors()) {
                reject(stats.toString(toStrOpt));
            } else {
                resolve(stats.toString(toStrOpt));
            }
        });
    });
}

(async () => {
    for (const cfg of webpackCfg) {
        try {
            const stats = await webpackCompile(cfg);
            console.log(stats);
        } catch (e) {
            console.err(e);
            process.exitCode = 1;
        }
    }
})();

/* eslint-disable no-console */

'use strict';

// cleanup process.argv before patch-package
let argv = process.argv.slice(2);
if (argv.length === 0) {
    argv = ['main', 'renderer'];
} else {
    process.argv = process.argv.slice(0, 2);
}

// yeah! patch packages!
require('patch-package');

process.env.NODE_ENV = 'production';

const webpack = require('webpack');

const { absPath, removeRecursive } = require('./util');

async function clean() {
    removeRecursive(absPath('dist'));
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
 * @returns {Promise<string>}
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

/**
 * @param {string[]} argv
 */
async function dist(argv) {
    let webpackCfg = [];
    if (argv.includes('main')) webpackCfg.push(require('./webpack.config.main'));
    if (argv.includes('renderer')) webpackCfg.push(require('./webpack.config.renderer'));

    if (!webpackCfg.length) {
        console.error('No dist target, expected "main" or "renderer"');
        process.exitCode = 1;
        return;
    }

    for (const cfg of webpackCfg) {
        try {
            const stats = await webpackCompile(cfg);
            console.log(stats);
        } catch (e) {
            console.error(e);
            process.exitCode = 1;
        }
    }
}

if (argv[0] === 'clean') {
    clean();
} else {
    dist(argv);
}

'use strict';

const { absPath, removeKeepDot } = require('./util');
const config = require('./config');

let argv = process.argv.slice(2);
if (!argv.length) argv = process.platform;

/* eslint-disable no-console */

if (argv[0] === 'clean') {
    removeKeepDot(absPath('build'));
    process.exit(0);
}

require('electron-packager')({
    name: config.appName ,
    executableName: config.packageName,
    arch: 'x64',
    asar: true,
    icon: absPath('assets/icons/icon'),
    dir: absPath('dist'),
    out: absPath('build'),
    overwrite: true,
    platform: argv
})
    .then(path => console.log(`Output: ${path}`))
    .catch(err => console.error(`Build failed: ${err.message}`));

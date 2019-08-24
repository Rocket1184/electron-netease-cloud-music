'use strict';

const { absPath, removeRecursive } = require('./util');
const config = require('./config');

let argv = process.argv.slice(2);
if (!argv.length) argv = process.platform;

function clean() {
    removeRecursive(absPath('build'));
}

/**
 * @param {string} argv
 */
function build(argv) {
    require('electron-packager')({
        name: config.productName,
        executableName: config.name,
        arch: 'x64',
        asar: true,
        icon: absPath('assets/icons/icon'),
        dir: absPath('dist'),
        out: absPath('build'),
        overwrite: true,
        platform: argv
    }).then(path => {
        console.log(`Output: ${path}`);
    }).catch(err => {
        console.error(`Build failed: ${err.message}`);
    });
}

if (argv[0] === 'clean') {
    clean();
} else {
    build(argv);
}

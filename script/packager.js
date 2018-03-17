const { absPath, removeKeepDot } = require('./util');
const packager = require('electron-packager');

let argv = process.argv.slice(2);
if (!argv.length) argv = 'all';

/* eslint-disable no-console */

if (argv[0] === 'clean') {
    removeKeepDot(absPath('build'));
    process.exit(0);
}

const options = {
    arch: 'x64',
    asar: true,
    icon: absPath('assets/icons/icon'),
    dir: absPath('dist'),
    out: absPath('build'),
    overwrite: true,
    platform: argv
};

packager(options, (err, path) => {
    if (err) {
        console.error('\nBuild failed: ');
        console.error(err);
    } else {
        console.log('\nBuild succeed! Output path:\n');
        console.log(`${path}\n`);
    }
});

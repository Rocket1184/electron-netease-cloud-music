const path = require('path');

const projectRoot = path.resolve('.');
const packager = require('electron-packager');

let argv = process.argv.slice(2);
if (!argv.length) argv = 'all';

if (argv[0] === 'clean') {
    const distPath = path.join(projectRoot, 'build');
    const cnt = require('fs').readdirSync(distPath).filter(f => f[0] !== '.').length;
    if (cnt) {
        require('child_process').execSync(`rm -r ${distPath}/*`);
        console.log('Clean build dist succeed.\n');
    }
    else console.log('Nothing to clean.\n');
    process.exit(0);
}

const options = {
    arch: 'x64',
    asar: true,
    icon: path.join(projectRoot, 'assets/icons/icon'),
    dir: path.join(projectRoot, 'dist'),
    out: path.join(projectRoot, 'build'),
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

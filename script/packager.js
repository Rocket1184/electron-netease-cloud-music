const path = require('path');

const projectRoot = path.resolve('.');
const packager = require('electron-packager');

let argv = process.argv.slice(2);
if (!argv.length) argv = 'all';

if (argv[0] === 'clean') {
    const distPath = path.resolve(projectRoot, 'dist');
    const cnt = require('fs').readdirSync(distPath).filter(f => f[0] !== '.').length;;
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
    dir: path.resolve(projectRoot, 'app'),
    out: path.resolve(projectRoot, 'dist'),
    ignore: [/assets/, /index\.ejs/, /yarn.lock/, /app\/src/],
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

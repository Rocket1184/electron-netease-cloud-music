const path = require('path');

const projectRoot = path.resolve('.');
const packager = require('electron-packager');

if (process.argv[2] === 'clean') {
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
    icon: path.resolve(projectRoot, 'app/icons/icon'),
    ignore: /\b(src|index\.ejs|icons)\b/,
    out: path.resolve(projectRoot, 'dist'),
    overwrite: true,
    platform: process.argv.slice(2) || ['linux', 'win32', 'drawin']
};

packager(options, (err, appPaths) => {
    if (err) {
        console.error('\nBuild failed: ');
        console.error(err);
    } else {
        console.log('\nBuild succeed! Output path(s):\n');
        console.log(appPaths);
    }
    console.log('\n');
});

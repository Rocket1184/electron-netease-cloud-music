const path = require('path');
const webpack = require('webpack');

const projectRoot = path.resolve('.');

let argv = process.argv.slice(2);
if (!argv.length) argv = ['main', 'renderer'];

if (argv[0] === 'clean') {
    const distPath = path.resolve(projectRoot, 'app/dist');
    const cnt = require('fs').readdirSync(distPath).filter(f => f[0] !== '.').length;
    if (cnt) {
        require('child_process').execSync(`rm -r ${distPath}/*`);
        console.log('Clean webpack bundle succeed.\n');
    }
    else console.log('Nothing to clean.\n');
    process.exit(0);
}

let webpackCfg = [];
if (~argv.indexOf('main')) webpackCfg.push(require('./webpack.config.main'));
if (~argv.indexOf('renderer')) webpackCfg.push(require('./webpack.config.renderer'));

if (!webpackCfg.length) {
    console.error('No pack target specified.');
    console.log('Expected "main" or "renderer"\n');
    process.exit(1);
}

webpack(webpackCfg, (err, stats) => {
    if (err) throw err;
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }));
    console.log('\n\nPack for ' + argv.join() + ' succeed.\n');
});

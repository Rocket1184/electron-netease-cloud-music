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
    console.error('No pack target specified.');
    console.log('Expected "main" or "renderer"\n');
    process.exit(1);
}

const dtStart = Date.now();
webpack(webpackCfg, (err, stats) => {
    const dtEnd = Date.now();
    if (err) throw err;
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: true,
        chunks: false,
        chunkModules: false
    }));
    console.log('\n\nPack for ' + argv.join(', ') + ' succeed.');
    console.log(`It takes ${(dtEnd - dtStart) / 1000} second(s).\n`);
});

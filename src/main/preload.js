'use strict';

const { resolve, join } = require('path');
require('module').globalPaths.push(join(resolve('.'), 'node_modules'));

const arg = '--initial-settings=';
let settings = {};
try {
    settings = JSON.parse(process.argv.find(v => v.startsWith(arg)).slice(arg.length));
} finally {
    window.__NCM_SETTINGS__ = settings;
}

if (!localStorage.getItem('debug')) {
    localStorage.setItem('debug', 'API');
}

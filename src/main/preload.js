'use strict';

const { resolve, join } = require('path');
// @ts-ignore
require('module').globalPaths.push(join(resolve('.'), 'node_modules'));

const arg = '--initial-settings=';
let settings = {};
try {
    settings = JSON.parse(process.argv.find(v => v.startsWith(arg)).slice(arg.length));
} finally {
    if (!sessionStorage.getItem('settings')) {
        sessionStorage.setItem('settings', JSON.stringify(settings));
    }
}

if (!localStorage.getItem('debug')) {
    localStorage.setItem('debug', 'API');
}

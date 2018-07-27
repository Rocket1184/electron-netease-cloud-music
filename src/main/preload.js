'use strict';

const { resolve, join } = require('path');
require('module').globalPaths.push(join(resolve('.'), 'node_modules'));

let settings = {};
try {
    settings = JSON.parse(process.argv.find(v => v.startsWith('--initial-settings=')).slice(19));
} finally {
    window.__NCM_SETTINGS__ = settings;
}

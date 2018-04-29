'use strict';

const fs = require('fs');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

const isProd = process.env.NODE_ENV === 'production';

const ProjectRoot = path.join(__dirname, '..');

function absPath(...paths) {
    return path.join(ProjectRoot, ...paths);
}

function removeKeepDot(dir) {
    const toRemove = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
    if (!toRemove.length) return false;
    toRemove.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isFile() && !file.startsWith('.')) {
            fs.unlinkSync(fullPath);
        } else if (stat.isDirectory) {
            removeKeepDot(fullPath);
            fs.rmdirSync(fullPath);
        }
    });
    return true;
}

module.exports = {
    isDev,
    isProd,
    absPath,
    removeKeepDot
};

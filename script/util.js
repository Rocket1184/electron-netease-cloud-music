'use strict';

const fsPromises = require('node:fs/promises');
const path = require('node:path');

const isDev = process.env.NODE_ENV === 'development';

const isProd = process.env.NODE_ENV === 'production';

const ProjectRoot = path.join(__dirname, '..');

function absPath(...paths) {
    return path.join(ProjectRoot, ...paths);
}

/**
 * like `rm -rf $pathname`
 * @param {string} pathname
 */
function removeRecursive(pathname) {
    return new Promise((resolve, reject) => {
        fsPromises.lstat(pathname).then(stat => {
            if (stat.isSymbolicLink() || stat.isFile()) {
                fsPromises.unlink(pathname).then(resolve).catch(reject);
            } else if (stat.isDirectory()) {
                fsPromises.readdir(pathname).then(files => {
                    const p = files.map(file => removeRecursive(path.join(pathname, file)));
                    Promise.all(p)
                        .then(() => fsPromises.rmdir(pathname))
                        .then(resolve)
                        .catch(reject);
                });
            }
        }).catch(reject);
    });
}

module.exports = {
    isDev,
    isProd,
    absPath,
    removeRecursive
};

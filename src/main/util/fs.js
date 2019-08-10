import fs from 'fs';
import path from 'path';

const fsPromises = fs.promises;

/**
 * get disk usage of file or directory
 * @param {string} pathname
 * @returns {Promise<number>}
 */
export function getDiskUsage(pathname) {
    return new Promise((resolve, reject) => {
        fsPromises.lstat(pathname).then(stat => {
            if (stat.isSymbolicLink() || stat.isFile()) {
                resolve(stat.size);
            } else if (stat.isDirectory()) {
                fsPromises.readdir(pathname).then(files => {
                    const p = files.map(file => getDiskUsage(path.join(pathname, file)));
                    Promise.all(p).then(sizes => {
                        const tot = sizes.reduce((a, b) => a + b, 0);
                        resolve(tot);
                    }).catch(reject);
                });
            }
        }).catch(reject);
    });
}

/**
 * like `rm -rf $pathname`
 * @param {string} pathname
 */
export function removeRecursive(pathname) {
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

/**
 * remove all files/directories in specified directory
 * @param {string} pathname
 */
export function clearDirectory(pathname) {
    return new Promise((resolve, reject) => {
        fsPromises.readdir(pathname).then(files => {
            const p = files.map(file => removeRecursive(path.join(pathname, file)));
            Promise.all(p).then(resolve).catch(reject);
        });
    });
}

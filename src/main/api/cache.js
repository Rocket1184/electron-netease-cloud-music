import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

import fetch from 'node-fetch';

class Cache {
    constructor(path) {
        if (typeof path === 'string') {
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            } else if (!fs.statSync(path).isDirectory) {
                throw new Error(`[Cache] '${path} was token by unknown file. Please remove it manually.'`);
            }
            this.path = path;
        } else {
            throw new Error('Cache path unvalid');
        }
        this.headers = {};
    }

    fullPath(fileName) {
        return path.join(this.path, String(fileName));
    }

    writeStream(fileName) {
        return fs.createWriteStream(this.fullPath(fileName));
    }

    /**
     * fetch http(s) url as stream
     * @param {string} url
     */
    fetch(url) {
        return fetch(url);
    }

    /**
     * fetch url as file, with file name specified
     * @param {string} url url to fetch
     * @param {string} outputFileName file name to write
     */
    async fetchAsFile(url, outputFileName) {
        const res = await fetch(url);
        if (res.status === 200) {
            res.body.pipe(this.writeStream(outputFileName));
            return this.fullPath(outputFileName);
        }
        throw res.status;
    }

    /**
     * save specified content to cache, with specified file name
     * @param {string} outputFileName cache file name to save
     * @param {any} data content to save
     * @returns {Promise<string>} saved file full path
     */
    save(outputFileName, data) {
        return new Promise((resolve, reject) => {
            if (data instanceof Readable) {
                data.pipe(this.writeStream(outputFileName));
                resolve(this.fullPath(outputFileName));
            } else {
                if (typeof data === 'object' && !Buffer.isBuffer(data)) {
                    data = JSON.stringify(data);
                }
                fs.writeFile(this.fullPath(outputFileName), data, err => {
                    if (err) reject(err);
                    resolve(this.fullPath(outputFileName));
                });
            }
        });
    }

    /**
     * wether file name exists in cache
     * @param {string} fileName
     * @returns {Promise<boolean>}
     */
    has(fileName) {
        return new Promise(resolve => {
            fs.exists(this.fullPath(fileName), resolve);
        });
    }

    /**
     * delete file name from cache
     * @param {string} fileName
     * @returns {Promise<void>}
     */
    rm(fileName) {
        return new Promise((resolve, reject) => {
            fs.unlink(this.fullPath(fileName), err => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}

export default Cache;

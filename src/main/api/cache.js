import fs from 'fs';
import URL from 'url';
import path from 'path';
import { Readable } from 'stream';

import { http, https } from 'follow-redirects';

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
     * @returns {Promise<import('http').IncomingMessage>}
     */
    fetch(url) {
        const opt = URL.parse(url);
        let request;
        switch (opt.protocol) {
            case 'http:':
                request = http;
                break;
            case 'https:':
                request = https;
                break;
            default:
                throw new Error(`Unsupported protocol ${opt.protocol}.`);
        }
        return new Promise(resolve => {
            request.get({
                host: opt.host,
                path: opt.path,
                headers: this.headers
            }, resolve);
        });
    }

    /**
     * fetch url as file, with file name specified
     * @param {string} url url to fetch
     * @param {string} outputFileName file name to write
     * @returns {Promise<string>} saved file full path
     * @throws {number} HTTP Error status code
     */
    fetchAsFile(url, outputFileName) {
        return new Promise((resolve, reject) => {
            fetch(url).then(res => {
                if (res.statusCode === 200) {
                    res.pipe(this.writeStream(outputFileName));
                    resolve(this.fullPath(outputFileName));
                } else {
                    reject(res.statusCode);
                }
            });
        });
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

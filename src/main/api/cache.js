import fs, { promises as fsp } from 'fs';
import path, { join } from 'path';
import { Readable } from 'stream';

import fetch from 'electron-fetch';

class Cache {
    /**
     * @param {string} path cache directory path
     * @param {string} configPath config directory path
     */
    constructor(path, configPath) {
        if (typeof path === 'string') {
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, {recursive: true});
            } else if (!fs.statSync(path).isDirectory()) {
                throw new Error(`[Cache] '${path}' was taken by unknown file. Please remove it manually.`);
            }

            // map of downloaded files
            this.mapPath = join(configPath, 'musicCache.json');
            try {
                if (!fs.existsSync(this.mapPath)) {
                    fs.writeFileSync(this.mapPath, '[]');
                }
                const externalData = fs.readFileSync(this.mapPath, 'utf8');
                const data = JSON.parse(externalData);
                this.external = new Map(data);
            } catch {
                this.external = new Map();
            }

            this.path = path;
        } else {
            throw new Error('Cache path unvalid');
        }
    }

    attachExternalCache(fileName, filePath) {
        this.external.set(fileName, filePath);
        fs.writeFileSync(this.mapPath, JSON.stringify([... this.external], null, 2));
    }

    /**
     * external & internal search
     * @param {string} fileName 
     */
    fullPath(fileName) {
        if (this.external.has(fileName)) {
            return this.external.get(fileName);
        }
        return path.join(this.path, String(fileName));
    }

    internalPath(fileName) {
        return path.join(this.path, String(fileName));
    }

    writeStream(fileName) {
        return fs.createWriteStream(this.internalPath(fileName));
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
            return this.internalPath(outputFileName);
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
                resolve(this.internalPath(outputFileName));
            } else {
                if (typeof data === 'object' && !Buffer.isBuffer(data)) {
                    data = JSON.stringify(data);
                }
                fs.writeFile(this.internalPath(outputFileName), data, err => {
                    if (err) reject(err);
                    resolve(this.internalPath(outputFileName));
                });
            }
        });
    }

    /**
     * 
     * @param {number} id 
     * @param {Types.MusicQuality} quality 
     * @returns {Promise<Types.MusicQuality | false>}
     */
    async hasHigherQuality(id, quality) {
        if (quality === 'ex') return false;
        if (await this.has(`${id}ex`)) return 'ex';
        if (quality === 'h') return false;
        if (await this.has(`${id}h`)) return 'h';
        if (quality === 'm') return false;
        if (await this.has(`${id}m`)) return 'm';
        return false;
    }

    /**
     * whether music id with quality exists
     * @param {string} fileName
     * @returns {Promise<boolean>}
     */
    async has(fileName) {
        try {
            await fsp.access(this.fullPath(fileName));
            return true;
        } catch {
            return false;
        }
    }

    /**
     * delete file name from cache
     * would not delete downloaded file
     * @param {string} fileName
     * @returns {Promise<void>}
     */
    async rm(fileName) {
        await fsp.unlink(this.internalPath(fileName));
    }
}

export default Cache;

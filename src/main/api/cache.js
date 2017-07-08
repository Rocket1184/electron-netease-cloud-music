import fs from 'fs';
import URL from 'url';
import path from 'path';
import { http, https } from 'follow-redirects';

class Cache {
    constructor(path) {
        if (typeof path === 'string') {
            if (fs.existsSync(path)) {
                if (fs.statSync(path).isDirectory) {
                    this.path = path;
                }
            } else {
                fs.mkdirSync(path);
            }
        } else {
            throw new Error('Cache path unvalid');
        }
        this.headers = {};
    }

    fullPath(fileName) {
        return path.join(this.path, fileName);
    }

    writeStream(fileName) {
        return fs.createWriteStream(this.fullPath(fileName));
    }

    fetch(url, outputFileName) {
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
        return new Promise((resolve, reject) => {
            request.get({
                host: opt.host,
                path: opt.path,
                headers: this.headers
            }, res => {
                if (res.statusCode === 200) {
                    res.pipe(this.writeStream(outputFileName));
                    resolve(this.fullPath(outputFileName));
                } else {
                    reject(res.statusCode);
                }
            });
        });
    }

    has(fileName) {
        return new Promise(resolve => {
            fs.exists(this.fullPath(fileName), resolve);
        });
    }

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

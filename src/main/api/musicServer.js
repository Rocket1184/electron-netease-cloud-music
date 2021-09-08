import fs from 'fs';
import url from 'url';
import qs from 'querystring';
import { createHash } from 'crypto';
import { createServer } from 'http';

import debug from 'debug';

import Cache from './cache';
import { getMusicUrlE } from './index';

const d = debug('MusicServer');
const fsPromises = fs.promises;

class MusicServer {
    /**
     * @param {string|Cache} cacheOrPath
     */
    constructor(cacheOrPath) {
        switch (typeof cacheOrPath) {
            case 'string':
                this.cache = new Cache(cacheOrPath);
                break;
            case 'object':
                if (cacheOrPath instanceof Cache) {
                    this.cache = cacheOrPath;
                } else {
                    throw new Error('[MusicServer] Invalid cache object');
                }
                break;
            default:
                throw new Error('[MusicServer] No Cache Object or path specificed');
        }
    }

    // credit: https://github.com/obastemur/mediaserver/blob/master/index.js#L38-L62
    /**
     * @param {import('http').IncomingMessage} req
     * @param {number} total
     */
    static getRange(req, total) {
        // <range-start> - <range-end> / <file-size>
        const range = [0, total, 0];
        const rinfo = req.headers ? req.headers.range : null;

        if (rinfo) {
            const rloc = rinfo.indexOf('bytes=');
            if (rloc >= 0) {
                const ranges = rinfo.substr(rloc + 6).split('-');
                try {
                    range[0] = parseInt(ranges[0]);
                    if (ranges[1] && ranges[1].length) {
                        range[1] = parseInt(ranges[1]);
                        range[1] = range[1] < 16 ? 16 : range[1];
                    }
                } catch (e) {
                    // ignore it
                }
            }
            if (range[1] === total) {
                range[1]--;
            }
            range[2] = total;
        }
        return range;
    }

    static buildHeaders(range) {
        return {
            'Cache-Control': 'no-cache, no-store',
            'Content-Length': range[1] - range[0] + 1,
            'Content-Type': 'audio/mpeg',
            'Accept-Ranges': 'bytes',
            'Content-Range': `bytes ${range[0]}-${range[1]}/${range[2]}`
        };
    }

    /**
     * try get music url
     * @param {number} id 
     * @param {string} quality
     */
    async getMusicUrl(id, quality) {
        const res = await getMusicUrlE(id, quality);
        d('res: %o', res);
        if (res.code !== 200 || res.data[0].code !== 200) throw res;
        return res.data[0];
    }

    /**
     * MusicServer HTTP request handler
     * @param {import('http').IncomingMessage} req
     * @param {import('http').ServerResponse} res
     */
    async serverHandler(req, res) {
        const location = url.parse(req.url);
        const params = qs.parse(location.query);
        d('Request hit %s', location.path);
        // check unexpected request method or url
        if (req.method !== 'GET' || location.pathname !== '/music') {
            d('What a Terrible Failure');
            res.writeHead(418, `I'm a teapot`);
            res.end('@see https://tools.ietf.org/html/rfc2324');
            return;
        }
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        const quality = Array.isArray(params.quality) ? params.quality[0] : params.quality || 'l';
        const ignoreCache = params.ignoreCache === 'true';
        const fileName = `${id}${quality}`;

        // check higher first
        const higherQuality = await this.cache.hasHigherQuality(id, quality);
        const isFromStart = req.headers.range === 'bytes=0-';

        if (higherQuality !== false && isFromStart) {
            d('Higher quality found, redirect %s -> %s', quality, higherQuality);
            const location = req.url.replace(/quality=\w+/, `quality=${higherQuality}`);
            res.statusCode = 302;
            res.setHeader('Location', location);
            res.end();
            return;
        }

        if (await this.cache.has(fileName)) {
            if (ignoreCache) {
                d('ignoreCache set, delete cache for music id=%d', id);
                try {
                    await this.cache.rm(fileName);
                } catch (e) { /* nothing happened */ }
            } else {
                const filePath = this.cache.fullPath(fileName);
                d('Hit cache for music id=%d', id);
                let stat = await fsPromises.stat(filePath);
                let range = MusicServer.getRange(req, stat.size);
                let start = Date.now();
                while (stat.size < range[0] && Date.now() - start <= 40 * 1000) {
                    await new Promise(_ => setTimeout(() => _(), 500));
                    let newStat = await fsPromises.stat(filePath);
                    range = MusicServer.getRange(req, newStat.size);
                    if (newStat.size === stat.size) {
                        // file size hasn't changed in 500ms, download may be finished ...
                        break;
                    }
                    stat = newStat;
                }
                res.writeHead(206, MusicServer.buildHeaders(range));
                fs.createReadStream(filePath, { start: range[0], end: range[1] }).pipe(res);
                return;
            }
        }
        try {
            const music = await this.getMusicUrl(Number.parseInt(id, 10), quality);
            d('Got URL for music id=%d', id);
            const musicRes = await this.cache.fetch(music.url.replace(/^http:/, 'https:'));
            // TODO: write file only md5 matches
            musicRes.body.pipe(this.cache.writeStream(fileName));

            const range = MusicServer.getRange(req, +musicRes.headers.get('content-length'));
            res.writeHead(206, MusicServer.buildHeaders(range));

            const checksum = createHash('md5');
            let receivedByteLength = 0;
            musicRes.body.on('data', data => {
                checksum.update(data);
                const length = Buffer.byteLength(data);
                if (receivedByteLength >= range[0]) {
                    receivedByteLength += length;
                    res.write(data);
                    return;
                }
                receivedByteLength += length;
                if (receivedByteLength >= range[0]) {
                    res.write(data.slice(receivedByteLength - range[0], length));
                }
            });
            musicRes.body.on('end', () => {
                const md5 = checksum.digest('hex');
                if (md5 === music.md5.toLowerCase()) {
                    d('Finish downloading music id=%d, md5=%s', id, md5);
                } else {
                    d('Download music id=%d hash mismatch, delete it ...', id);
                    this.cache.rm(fileName);
                }
                res.end();
            });
            musicRes.body.on('error', e => {
                d('Error when downloading music id=%d, reason: %o, aborting ...', id, e);
                this.cache.rm(fileName).catch(() => { /* noop */ });
                musicRes.body.unpipe();
                res.end();
            });
        } catch (e) {
            d('Failed to get URL for music id=%d', id);
            res.writeHead(500);
            res.write(JSON.stringify(e));
            res.end();
        }
    }

    listen() {
        return new Promise((resolve, reject) => {
            if (!this.server) {
                this.server = createServer(this.serverHandler.bind(this));
            }
            if (this.server.listening) {
                reject(new Error('[MusicServer] already listening'));
                return;
            }
            // `0` means bind to a random, free port assigned by the OS
            this.server.listen(0, () => {
                const addr = this.server.address();
                d('listening on %o', addr);
                resolve(addr);
            });
        });
    }
}

export default MusicServer;

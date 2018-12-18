import fs from 'fs';
import url from 'url';
import debug from 'debug';
import qs from 'querystring';
import { promisify } from 'util';
import { createHash } from 'crypto';
import { createServer } from 'http';

import Cache from './cache';
import { getMusicUrl, getMusicUrlLinux } from './index';

const d = debug('MusicServer');

const statAsync = promisify(fs.stat);

class MusicServer {
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
     * @returns {{code:number; url: string?; md5: string}}
     */
    async getMusicUrl(id, quality) {
        try {
            const resWeb = await getMusicUrl(id, quality);
            d('resWeb: %o', resWeb);
            if (resWeb.code !== 200) {
                throw resWeb;
            }
            if (resWeb.code === 200) {
                const dataWeb = resWeb.data[0];
                if (dataWeb.code !== 200) {
                    throw dataWeb;
                }
                return dataWeb;
            }
        } catch (e) {
            d('request to "/weapi/song" not 200, retry "/linux/forward"');
            const resLinux = await getMusicUrlLinux(id, quality);
            d('resLinux: %o', resLinux);
            if (resLinux.code !== 200) {
                throw resLinux;
            }
            const dataLinux = resLinux.data[0];
            if (dataLinux.code !== 200) {
                throw dataLinux;
            }
            return dataLinux;
        }
    }

    /**
     * MusicServer HTTP request handler
     * @param {import('http').ClientRequest} req
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
        const id = params['id'];
        const quality = params['quality'] || 'l';
        const fileName = `${id}${quality}`;
        const filePath = this.cache.fullPath(fileName);
        // check cache first
        if (await this.cache.has(fileName)) {
            d('Hit cache for music id=%d', id);
            const stat = await statAsync(filePath);
            const range = MusicServer.getRange(req, stat.size);
            // TODO: <range-end> may larger than <file-size>, cause file is still being downloaded
            const file = fs.createReadStream(filePath, { start: range[0], end: range[1] });
            res.writeHead(206, MusicServer.buildHeaders(range));
            file.pipe(res);
            return;
        }
        try {
            const music = await this.getMusicUrl(id, quality);
            d('Got URL for music id=%d', id);
            const musicRes = await this.cache.fetch(music.url);
            musicRes.body.pipe(fs.createWriteStream(filePath));

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
        } catch (e) {
            d('Failed to get URL for music id=%d, reason: %O', id, e);
            res.writeHead(500);
            res.write(e);
            res.end();
        }
    }

    listen(...args) {
        if (this.server) {
            if (this.server.listening) {
                throw new Error('[MusicServer] already listening');
            } else {
                this.server.listen(...args);
            }
        } else {
            this.server = createServer(this.serverHandler.bind(this));
            this.server.listen(...args);
            d('listening on %o', args);
        }
    }
}

export default MusicServer;

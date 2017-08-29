import fs from 'fs';
import url from 'url';
import debug from 'debug';
import qs from 'querystring';
import { createServer } from 'http';

import Cache from './cache';
import { getMusicUrl } from '.';

const d = debug('MusicServer');

function statAsync(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stat) => {
            if (err) reject(err);
            else resolve(stat);
        });
    });
}

// credit: https://github.com/obastemur/mediaserver/blob/master/index.js#L38-L62
function getRange(req, total) {
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
            } catch (e) { }
        }
        if (range[1] == total) {
            range[1]--;
        }
        range[2] = total;
    }
    return range;
};

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

    static async serverHandler(cache, req, res) {
        const location = url.parse(req.url);
        const params = qs.parse(location.query);
        d(`Request hit ${location.path}`);
        if (req.method === 'GET' && location.pathname === '/music') {
            const id = params['id'];
            const quality = params['quality'] || 'l';
            const fileName = `${id}${quality}`;
            const filePath = cache.fullPath(fileName);
            if (await cache.has(fileName)) {
                d(`Hit cache for music id=${id}`);
                const stat = await statAsync(filePath);
                const range = getRange(req, stat.size);
                // TODO: <range-end> may larger than <file-size>, cause file is still being downloaded
                const file = fs.createReadStream(filePath, { start: range[0], end: range[1] });
                res.writeHead(206, {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'audio/mpeg',
                    'Accept-Ranges': 'bytes',
                    'Content-Range': `bytes ${range[0]}-${range[1]}/${stat.size}`
                });
                file.pipe(res);
            } else {
                const oUrl = await getMusicUrl(id, quality);
                if (oUrl.data[0].code === 200) {
                    d(`Got URL for music id=${id}`);

                    const st = await cache.fetch(oUrl.data[0].url, fileName);
                    st.pipe(fs.createWriteStream(filePath));

                    const realLength = st.headers['content-length'];
                    const range = getRange(req, realLength);
                    res.writeHead(206, {
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'audio/mpeg',
                        'Accept-Ranges': 'bytes',
                        'Content-Range': `bytes ${range[0]}-${range[1]}/${realLength}`
                    });

                    let stat = await statAsync(filePath);
                    let file = fs.createReadStream(filePath);
                    file.pipe(res, { end: false });
                    async function endHandler() {
                        d('stream end but not finished');
                        const newStat = await statAsync(filePath);
                        if (newStat.size < realLength) {
                            if (newStat.size <= stat.size || stat.size == 0) {
                                d('no more data gain, wait 100ms');
                                setTimeout(endHandler, 100);
                            } else {
                                d(`restart at ${stat.size}`);
                                file = fs.createReadStream(filePath, { start: stat.size, end: newStat.size - 1 });
                                file.pipe(res, { end: false });
                                file.on('end', endHandler);
                            }
                            stat = newStat;
                        } else {
                            d(`stream ending, total size ${newStat.size}`);
                            file = null;
                            fs.createReadStream(filePath, { start: stat.size }).pipe(res);
                        }
                    }
                    file.on('end', endHandler);
                } else {
                    d(`Cannot get URL for music id=${id}`);
                    res.writeHead(404);
                    res.end();
                }
            }
        } else {
            d('What a Terrible Failure request');
            res.writeHead(400);
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
            this.server = createServer((req, res) => MusicServer.serverHandler(this.cache, req, res));
            this.server.listen(...args);
            d(`listening on ${JSON.stringify(args)}`);
        }
    }
}

export default MusicServer;

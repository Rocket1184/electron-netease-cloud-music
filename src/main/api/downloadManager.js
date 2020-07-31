
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import Cache from './cache';
import { getPicUrl } from './index';
import { request } from 'https';

/**
 * 
 * @param {string} url 
 * @returns {Promise<Buffer>}
 */
const fakeFetch = (url) => {
    return new Promise((resolve, reject) => {
        const data = [];
        request(url, (res) => {
            res.on('data', (chuck) => {
                data.push(chuck);
            });
            res.on('end', () => {
                resolve(Buffer.concat(data));
            });
            res.on('error', (err) => {
                reject(err);
            });
        }).end();
    });
}

/**
 * @param {number} x 
 * @returns {Buffer}
 */
const number2buffer = (x) => {
    const buf = Buffer.alloc(4);
    buf.writeInt32BE(x, 0);
    return buf;
}

const createTag = (tagname, data) => {
    return Buffer.concat([
        // TAG name
        Buffer.from(tagname),
        // size
        number2buffer(data.length),
        // flag
        Buffer.from([ 0x00, 0x00 ]),
        data,
    ]);
}

const iso2buffer = (str) => {
    return Buffer.concat([
        Buffer.from(str, 'ascii'),
        Buffer.from([ 0x00 ]),
    ]);
}

const createAPICTag = (cover) => {
    const data = Buffer.concat([
        // text encoding: UTF-8
        Buffer.from([ 0x00 ]),
        // MIME type: image/jpeg
        iso2buffer('image/jpeg'),
        // picture type: Cover (front)
        Buffer.from([ 0x03 ]),
        // description: nothing
        iso2buffer(''),
        cover,
    ]);
    return createTag('APIC', data);
}

const textencoder = new TextEncoder('utf-8');
const utf2buffer = (str) => {
    const text = textencoder.encode(str);
    return Buffer.concat([
        // utf8 header
        Buffer.from([ 0xef, 0xbb, 0xbf ]),
        // content
        Buffer.from(text),
        // ending
        Buffer.from([ 0x00, 0x00 ]),
    ]);
}

const createTextTag = (tagname, text) => {
    return createTag(tagname, Buffer.concat([
        // encoding: unicode
        Buffer.from([ 0x01 ]),
        // encode text
        utf2buffer(text),
    ]));
}

const createTIT2Tag = createTextTag.bind(null, 'TIT2');
const createTCOMTag = createTextTag.bind(null, 'TCOM');
const createTALBTag = createTextTag.bind(null, 'TALB');

const parseTagLength = (buf) => {
    return buf[0] * (1 << 21)
         + buf[1] * (1 << 14)
         + buf[2] * (1 <<  7)
         + buf[3] * (1      );
}
const toTagLength = (x) => {
    return Buffer.from([
        (x >> 28) & 0x7f,
        (x >> 14) & 0x7f,
        (x >>  7) & 0x7f,
        (x      ) & 0x7f,
    ])
}

class DownloadManager {
    /**
     * @param {Cache} cache 
     * @param {string} dist
     */
    constructor(cache, dist = path.join(homedir(), 'Music', 'ElectronNCM')) {
        this.cache = cache;
        this.dist = dist;
    }

    /**
     * @returns {Types.DownloadSongRes}
     */
    async download(metadata) {
        // default quality is ex
        const filename = `${metadata.id}ex`;
        try {

            if (await this.cache.has(filename)) {
                const cover = await fakeFetch(getPicUrl(metadata.album.pic).url);
                const originalFile = fs.readFileSync(this.cache.fullPath(filename));
                const APIC = createAPICTag(cover);
                const TIT2 = createTIT2Tag(metadata.name);
                const TCOM = createTCOMTag(metadata.artistName);
                const TALB = createTALBTag(metadata.album.name);
                const originalTagLength = parseTagLength(originalFile.slice(6, 10));
                const result = Buffer.concat([
                    originalFile.slice(0, 6),
                    toTagLength(originalTagLength + TIT2.length + TCOM.length + TALB.length + APIC.length),
                    TIT2,
                    TCOM,
                    TALB,
                    APIC,
                    originalFile.slice(10),
                ]);
                const distpath = path.join(this.dist, metadata.name + '.mp3');
                if (!fs.existsSync(this.dist)) {
                    fs.mkdirSync(this.dist, { recursive: true });
                }
                if (fs.existsSync(distpath)) {
                    throw new Error('好像已经下载过了呀');
                }
                fs.writeFileSync(distpath, result);
                return {
                    success: true,
                    url: distpath,
                }
            } else {
                throw new Error('请先播放一下呀');
            }
        } catch (e) {
            return {
                success: false,
                error: e.message,
            }
        }
    }

    async isDownloaded(trackId) {
        return false;
    }
}

export default DownloadManager;

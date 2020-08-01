
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import Cache from './cache';
import { getPicUrl } from './index';
import { request } from 'https';
import ID3 from './id3';

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

            if (!await this.cache.has(filename)) {
                throw new Error('请先播放一下呀');
            }

            const cover = await fakeFetch(getPicUrl(metadata.album.pic).url);
            const originalFile = fs.readFileSync(this.cache.fullPath(filename));
            const distFile = new ID3(originalFile);
            distFile.addTIT2Tag(metadata.name);
            distFile.addTCOMTag(metadata.artistName);
            distFile.addTALBTag(metadata.album.name);
            distFile.addAPICTag(cover);

            const distpath = path.join(this.dist, metadata.name + '.mp3');
            if (!fs.existsSync(this.dist)) {
                fs.mkdirSync(this.dist, { recursive: true });
            }
            if (fs.existsSync(distpath)) {
                throw new Error('好像已经下载过了呀');
            }
            fs.writeFileSync(distpath, distFile.toBuffer());
            return {
                success: true,
                url: distpath,
            }
        } catch (e) {
            return {
                success: false,
                error: e.message,
            }
        }
    }

    // TODO
    async isDownloaded(trackId) {
        return false;
    }
}

export default DownloadManager;

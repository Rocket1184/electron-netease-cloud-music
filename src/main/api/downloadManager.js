
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import Cache from './cache';
import { getPicUrl } from './index';
import fetch from 'electron-fetch';
import ID3 from './id3';

const getFileName = (metadata) => {
    return `${metadata.artistName
        .split(' / ')
        .map((x) => x.split('/')[0])
        .join(', ')
    } - ${metadata.name}.mp3`;
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
                throw new Error('下载前需要先播放一下啦');
            }

            // TODO: flac file
            const originalFile = fs.readFileSync(this.cache.fullPath(filename));
            const distFile = new ID3(originalFile);
            distFile.addTIT2Tag(metadata.name);
            distFile.addTCOMTag(metadata.artistName);
            distFile.addTALBTag(metadata.album.name);

            const coverRes = await fetch(getPicUrl(metadata.album.pic).url);
            if (coverRes.status === 200) {
                const buf = await coverRes.buffer();
                distFile.addAPICTag(buf);
            }

            const distpath = path.join(this.dist, getFileName(metadata));
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

    async isDownloaded(metadata) {
        const distpath = path.join(this.dist, getFileName(metadata));
        return fs.existsSync(distpath);
    }
}

export default DownloadManager;

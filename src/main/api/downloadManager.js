
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import Cache from './cache';
import { getPicUrl } from './index';
import fetch from 'electron-fetch';
import ID3 from './media/id3';
import FLAC from './media/flac';

const getFileName = (metadata, ext) => {
    return `${metadata.artistName
        .split(' / ')
        .map((x) => x.split('/')[0])
        .join(', ')
    } - ${metadata.name}.${ext}`;
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
        // TODO: support more quality
        const filename = `${metadata.id}ex`;
        try {

            if (!await this.cache.has(filename)) {
                throw new Error('下载前需要先播放一下啦');
            }

            const originalFile = fs.readFileSync(this.cache.fullPath(filename));

            let cover = null;
            const coverRes = await fetch(getPicUrl(metadata.album.pic).url);
            if (coverRes.status === 200) {
                cover = await coverRes.buffer();
            }
            
            let distname = '', distbuffer = null;
            if (ID3.validate(originalFile)) {
                const distFile = new ID3(originalFile);
                distFile.addTIT2Tag(metadata.name);
                distFile.addTCOMTag(metadata.artistName);
                distFile.addTALBTag(metadata.album.name);
                if (cover !== null) {
                    distFile.addAPICTag(cover);
                }
                distbuffer = distFile.toBuffer();
                distname = getFileName(metadata, 'mp3');
            } else if (FLAC.validate(originalFile)) {
                const distFile = new FLAC(originalFile);
                distFile.insertCover(cover);
                distbuffer = distFile.toBuffer();
                distname = getFileName(metadata, 'flac');
            } else {
                throw new Error('未知的音乐格式！');
            }

            if (!distname || !distbuffer) {
                throw new Error('解析音乐文件时发生错误！');
            }

            const distpath = path.join(this.dist, distname);
            if (!fs.existsSync(this.dist)) {
                fs.mkdirSync(this.dist, { recursive: true });
            }
            if (fs.existsSync(distpath)) {
                throw new Error('好像已经下载过了呀');
            }
            fs.writeFileSync(distpath, distbuffer);
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
        const distpath1 = path.join(this.dist, getFileName(metadata, 'mp3'));
        const distpath2 = path.join(this.dist, getFileName(metadata, 'flac'));
        return fs.existsSync(distpath1) || fs.existsSync(distpath2);
    }
}

export default DownloadManager;

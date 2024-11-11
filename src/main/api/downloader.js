
import fs, { promises as fsp } from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { getPicUrl, getMusicUrlE } from './index';
import fetch from 'electron-fetch';
import ID3 from './media/id3';
import FLAC from './media/flac';

import debug from 'debug';

const d = debug('Downloader');

/**
 * Replace all slashes to spaces
 * @param {string} text 
 */
function escapeSlash(text) {
    if (process.platform === 'win32') {
        return text.replace(/[<>:"/\\|?*]/g, ' ');
    }
    return text.replace(/\//g, ' ');
}

/**
 * Get a valid output file name
 * @param {Models.Track} metadata 
 * @param {string} ext 
 * @returns {string}
 */
function getFileName(metadata, ext) {
    // replace slash to space
    const artists = metadata.artists
        .map(({ name }) => escapeSlash(name))
        .join(', ');
    const title = escapeSlash(metadata.name);

    return `${artists} - ${title}.${ext}`;
}

class Downloader {
    /**
     * @param {import('./cache').default} cache 
     * @param {string} dist
     */
    constructor(cache, dist) {
        this.cache = cache;
        this.dist = dist || path.join(app.getPath('music'), 'ElectronNCM');
    }

    /**
     * Download track to `this.dist` directory
     * @param {Models.Track} metadata
     * @param {Types.MusicQuality} quality
     * @returns {Promise<Types.DownloadSongRes>}
     */
    async download(metadata, quality) {
        d('Started to download id=%d, quality=%s', metadata.id, quality);
        try {
            let urlRes;
            try {
                urlRes = await getMusicUrlE(metadata.id, quality);
            } catch(e) {
                throw new Error('获取下载链接失败');
            }
            let dlUrl;
            if (urlRes.data[0].isUnm == true){
                dlUrl = urlRes.data[0].url;
            } else {
                dlUrl = urlRes.data[0].url.replace(/^http:/, 'https:');
            }
            const dlRes = await fetch(dlUrl);
            if (dlRes.status !== 200) {
                throw new Error(`下载失败 ${dlRes.status}`);
            }
            const originalFile = await dlRes.buffer();

            // fetch cover
            // Q: Why should we fetch several times here?
            // A: Some pictures are too large. (~25MB)
            //    And FLAC only support pictures smaller than 16MB
            // e.g. https://p3.music.126.net/5Ox3BiabKcaHFTcQCXN1yA==/109951164249692467.jpg
            let cover = null;
            const picUrl = getPicUrl(metadata.album.pic).url;
            const possiblePicUrl = [
                `${picUrl}`,
                `${picUrl}?param=1000y1000`,
                `${picUrl}?param=500y500`,
                `${picUrl}?param=200y200`,
            ];
            for (const url of possiblePicUrl) {
                const response = await fetch(url);
                if (response.status === 200) {
                    const buf = await response.buffer();
                    if (buf.length <= 0xff0000) {
                        // is capable to put inside
                        cover = buf;
                        break;
                    }
                }
            }

            let distname = '', distbuffer = null;
            if (ID3.validate(originalFile)) {
                const distFile = new ID3(originalFile);
                distFile.addTIT2Tag(metadata.name);
                distFile.addTCOMTag(metadata.artistName);
                distFile.addTPE1Tag(metadata.artistName);
                distFile.addTALBTag(metadata.album.name);
                distFile.addTRCKTag(metadata.no);
                if (cover !== null) {
                    distFile.addAPICTag(cover);
                }
                distbuffer = distFile.toBuffer();
                distname = getFileName(metadata, 'mp3');
            } else if (FLAC.validate(originalFile)) {
                const distFile = new FLAC(originalFile);
                distFile.addTITLEComment(metadata.name);
                metadata.artists.forEach(({ name }) => {
                    distFile.addARTISTComment(name);
                });
                distFile.addTRACKNUMBERComment(metadata.no);
                distFile.addALBUMComment(metadata.album.name);
                if (cover !== null) {
                    distFile.attachPicture(cover);
                }
                distbuffer = await distFile.toBuffer();
                distname = getFileName(metadata, 'flac');
            } else {
                throw new Error('未知的音乐格式');
            }

            if (!distname || !distbuffer) {
                throw new Error('解析音乐文件时发生错误');
            }

            const distpath = path.join(this.dist, distname);
            if (!fs.existsSync(this.dist)) {
                await fsp.mkdir(this.dist, { recursive: true });
            }
            if (fs.existsSync(distpath)) {
                throw new Error('下载地址被占用');
            }
            await fsp.writeFile(distpath, distbuffer);

            this.cache.attachExternalCache(`${metadata.id}${quality}`, distpath);

            d('Download success, id=%d, quality=%s, distpath=%s', metadata.id, quality, distpath);

            return {
                success: true,
                url: distpath,
            };
        } catch (e) {
            d('What a terrible failure. %s', e.message);

            return {
                success: false,
                error: e.message,
            };
        }
    }

    /**
     * Check if the track is downloaded
     * @param {Models.Track} metadata 
     * @returns {boolean}
     */
    check(metadata) {
        const distpath1 = path.join(this.dist, getFileName(metadata, 'mp3'));
        const distpath2 = path.join(this.dist, getFileName(metadata, 'flac'));
        return fs.existsSync(distpath1) || fs.existsSync(distpath2);
    }
}

export default Downloader;

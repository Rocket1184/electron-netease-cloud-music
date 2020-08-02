
import fs, { promises as fsp } from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import { getPicUrl } from './index';
import fetch from 'electron-fetch';
import ID3 from './media/id3';
import FLAC from './media/flac';

/**
 * Replace all slashes to spaces
 * @param {string} text 
 */
function escapeSlash(text) {
    return text.replace(/\//g, ' ');
}

/**
 * Get a valid output file name
 * @param {?} metadata 
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
        this.dist = dist || path.join(homedir(), 'Music', 'ElectronNCM');
    }

    /**
     * Download track to `this.dist` directory
     * @param {?} metadata
     * @returns {Promise<Types.DownloadSongRes>}
     */
    async download(metadata) {
        try {
            const filenames = [
                `${metadata.id}ex`,
                `${metadata.id}h`,
                `${metadata.id}m`,
                `${metadata.id}l`,
            ];

            let filename = null;
            for (const name of filenames) {
                if (await this.cache.has(name)) {
                    filename = name;
                    break;
                }
            }
            if (filename === null) {
                throw new Error('歌曲还没有缓存！');
            }

            const originalFile = await fsp.readFile(this.cache.fullPath(filename));

            // Q: Why shood we fetch serval times here?
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
                    if (buf.length <= 0xffff00) {
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
                distFile.addTITLEcomment(metadata.name);
                metadata.artists.forEach(({ name }) => {
                    distFile.addARTISTcomment(name);
                });
                distFile.addTRACKNUMBERcomment(metadata.no);
                distFile.addALBUMcomment(metadata.album.name);
                if (cover !== null) {
                    distFile.insertCover(cover);
                }
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
                await fsp.mkdir(this.dist, { recursive: true });
            }
            if (fs.existsSync(distpath)) {
                throw new Error('好像已经下载过了呀');
            }
            await fsp.writeFile(distpath, distbuffer);
            return {
                success: true,
                url: distpath,
            };
        } catch (e) {
            return {
                success: false,
                error: e.message,
            };
        }
    }

    /**
     * Check if the track is downloaded
     * @param {?} metadata 
     * @returns {boolean}
     */
    check(metadata) {
        const distpath1 = path.join(this.dist, getFileName(metadata, 'mp3'));
        const distpath2 = path.join(this.dist, getFileName(metadata, 'flac'));
        return fs.existsSync(distpath1) || fs.existsSync(distpath2);
    }
}

export default Downloader;

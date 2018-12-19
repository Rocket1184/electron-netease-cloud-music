import fs from 'fs';
import url from 'url';
import path from 'path';
import crypto from 'crypto';
import cp from 'child_process';
import { app } from 'electron';

import { Lrc } from 'lrc-kit';

import Cache from './cache';
import Client from './httpClient';
import * as Settings from '../settings';
import MusicServer from './musicServer';

const BaseURL = 'https://music.163.com';

const client = new Client();

const appDataPath = path.join(app.getPath('appData'), Settings.appName);
const cachePathMap = {
    all: appDataPath,
    music: path.join(appDataPath, 'musicCache'),
    lyric: path.join(appDataPath, 'lyricCache')
};
const musicCache = new Cache(cachePathMap.music);
const lyricCache = new Cache(cachePathMap.lyric);

const musicServer = new MusicServer(musicCache);
let musicServerPort = 0;
musicServer.listen().then(addr => musicServerPort = addr.port);

/**
 * clear all cookies, and set cookie as given arguments
 * @param {string | string[] | Record<string, string>} arg 
 */
export function updateCookie(cookie) {
    client.updateCookie(cookie);
}

/**
 * @param {string?} key
 * @returns {string | Record<string, string>}
 */
export function getCookie(key) {
    return client.getCookie(key);
}

/**
 * @param {string} acc email, username or phone
 * @param {string} pwd password
 * @returns {Promise<Types.LoginRes>}
 */
export function login(acc, pwd) {
    const password = crypto.createHash('md5').update(pwd).digest('hex');
    const postBody = {
        password,
        rememberLogin: true,
    };
    if (/^1\d{10}$/.test(acc)) {
        return client.post({
            url: `${BaseURL}/weapi/login/cellphone`,
            data: { phone: acc, ...postBody }
        });
    } else {
        return client.post({
            url: `${BaseURL}/weapi/login`,
            data: { username: acc, ...postBody }
        });
    }
}

export function refreshLogin() {
    return client.post({
        url: `${BaseURL}/weapi/login/token/refresh`,
        data: {}
    });
}

export async function logout() {
    const resp = await client.post({ url: `${BaseURL}/logout` });
    if (resp.code === 200) {
        client.updateCookie({});
    }
    return resp.code;
}

/**
 * @param {number} uid
 * @returns {Promise<Types.UserPlaylistRes>}
 */
export function getUserPlaylist(uid) {
    return client.post({
        url: `${BaseURL}/weapi/user/playlist`,
        data: {
            uid,
            offset: 0,
            limit: 1000,
        }
    });
}

/**
 * 用户听歌记录
 * @param {number} uid
 * @param {0|1} type `0`: 所有时间, `1`: 最近一周
 */
export function getMusicRecord(uid, type = 0) {
    return client.post({
        url: `${BaseURL}/weapi/v1/play/record`,
        data: {
            limit: 1000,
            offset: 0,
            total: true,
            type,
            uid,
        }
    });
}

/**
 * 每日歌曲推荐
 * @returns {Promise<Types.RecommendSongsRes>}
 */
export function getRecommendSongs() {
    return client.post({
        url: `${BaseURL}/weapi/v2/discovery/recommend/songs`,
        data: {
            limit: 20,
            offset: 0,
            total: true
        }
    });
}

/** 
 * 每日歌曲推荐 -> 不感兴趣
 */
export function dislikeMusic(id) {
    return client.post({
        url: `${BaseURL}/weapi/v2/discovery/recommend/dislike`,
        data: {
            resId: id,
            resType: 4,
            sceneType: 1
        }
    });
}

/**
 * 推荐歌单
 */
export function getRecommendPlaylist() {
    return client.post({
        url: `${BaseURL}/weapi/discovery/recommend/resource`,
        data: {}
    });
}

/**
 * 推荐歌单 -> 不感兴趣
 * @param {number} id
 * @param {'bysong_rt'|'hotbased'} alg `bysong_rt`: 根据收藏的单曲推荐, `hotbased`: 热门推荐
 */
export function dislikePlaylist(id, alg) {
    return client.post({
        url: `${BaseURL}/weapi/v2/discovery/recommend/dislike`,
        data: {
            resId: id,
            resType: 1,
            type: alg
        }
    });
}

/**
 * @param {number} id
 * @returns {Promise<Types.ListDetailRes>}
 */
export function getListDetail(id) {
    return client.post({
        url: `${BaseURL}/weapi/v3/playlist/detail`,
        data: {
            id,
            offset: 0,
            total: true,
            limit: 1000,
            n: 1000,
        }
    });
}

const QualityMap = {
    h: 320000,
    m: 192000,
    l: 128000
};

/**
 * temporary music url on netease's server
 * @param {number|number[]} idOrIds
 * @param {Types.MusicQuality} quality
 * @returns {Promise<Types.MusicUrlRes>}
 */
export function getMusicUrl(idOrIds, quality) {
    if (!QualityMap[quality]) throw new Error(`Quality type '${quality}' is not in [h,m,l]`);
    let ids;
    if (Array.isArray(idOrIds)) ids = idOrIds;
    else ids = [idOrIds];
    return client.post({
        url: `${BaseURL}/weapi/song/enhance/player/url`,
        data: {
            ids,
            br: QualityMap[quality],
        }
    });
}

/**
 * music url with 'linux/forward' api
 * @param {number|number[]} idOrIds
 * @param {Types.MusicQuality} quality
 * @returns {Promise<Types.MusicUrlRes>}
 */
export function getMusicUrlLinux(idOrIds, quality) {
    if (!QualityMap[quality]) throw new Error(`Quality type '${quality}' is not in [h,m,l]`);
    let ids;
    if (Array.isArray(idOrIds)) ids = idOrIds;
    else ids = [idOrIds];
    return client.post({
        url: `${BaseURL}/api/linux/forward`,
        encrypt: 'linux',
        headers: {
            Cookie: 'os=pc; osver=Linux; appver=2.0.3.131777; channel=netease'
        },
        data: {
            method: 'POST',
            url: 'http://music.163.com/api/song/enhance/player/url',
            params: {
                ids,
                br: QualityMap[quality],
            }
        }
    });
}

/**
 * get musicServer's cached music url
 * @param {number} id
 * @param {Types.MusicQuality} quality
 * @returns {Promise<Types.MusicUrlCachedRes>}
 */
export function getMusicUrlCached(id, quality) {
    return {
        url: url.format({
            protocol: 'http:',
            hostname: '127.0.0.1',
            port: musicServerPort,
            pathname: '/music',
            query: { id, quality }
        })
    };
}

/**
 * musicServer's music url, but force the cache
 * @param {number} id
 * @param {Types.MusicQuality} quality
 * @returns {Promise<Types.MusicUrlCachedRes>}
 */
export function getMusicUrlNoCache(id, quality) {
    musicCache.rm(id).catch(() => { /* nothing happened */ });
    return getMusicLyricCached(id, quality);
}

/**
 * @param {number} rid
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Types.MusicCommentsRes>}
 */
export function getMusicComments(rid, limit = 20, offset = 0) {
    return client.post({
        url: `${BaseURL}/weapi/v1/resource/comments/R_SO_4_${rid}`,
        data: {
            rid,
            offset,
            limit,
        }
    });
}

function byTimestamp(a, b) {
    return a.timestamp - b.timestamp;
}

/**
 * @param {number} id
 * @returns {Promise<Types.MusicLyricRes>}
 */
export async function getMusicLyric(id) {
    const tmp = await client.post({
        url: `${BaseURL}/weapi/song/lyric`,
        data: {
            id,
            lv: -1,
            tv: -1
        }
    });
    let result = {};
    if (tmp.lrc && tmp.lrc.version) {
        result.lrc = Lrc.parse(tmp.lrc.lyric);
        result.lrc.lyrics.sort(byTimestamp);
        result.lyricUser = tmp.lyricUser;
    }
    if (tmp.tlyric && tmp.tlyric.version) {
        result.transUser = tmp.transUser;
        let tlrc = Lrc.parse(tmp.tlyric.lyric);
        tlrc.lyrics.sort(byTimestamp);
        let mlrc = {
            info: result.lrc.info,
            transInfo: tlrc.info,
            lyrics: result.lrc.lyrics.slice()
        };
        let i = 0;
        let j = 0;
        while (i < mlrc.lyrics.length && j < tlrc.lyrics.length) {
            if (mlrc.lyrics[i].timestamp === tlrc.lyrics[j].timestamp) {
                mlrc.lyrics[i].trans = tlrc.lyrics[j].content;
                i++; j++;
            } else if (mlrc.lyrics[i].timestamp < tlrc.lyrics[j].timestamp) {
                i++;
            } else {
                j++;
            }
        }
        result.mlrc = mlrc;
    }
    return result;
}

/**
 * @param {number} id
 * @returns {Promise<Types.MusicLyricRes>}
 */
export async function getMusicLyricCached(id) {
    if (await lyricCache.has(id)) {
        return new Promise((resolve, reject) => {
            fs.readFile(lyricCache.fullPath(id), (err, data) => {
                if (!err) {
                    resolve(JSON.parse(data.toString()));
                } else {
                    reject(err);
                }
            });
        });
    } else {
        const lyric = await getMusicLyric(id);
        lyricCache.save(id, lyric);
        return lyric;
    }
}

/**
 * this maybe have been removed, use `sumbitFeedback` instead
 */
export function submitWebLog(action, json) {
    return client.post({
        url: `${BaseURL}/weapi/log/web`,
        data: {
            action,
            json: JSON.stringify(json),
        }
    });
}

export function sumbitFeedback(logs) {
    return client.post({
        url: `${BaseURL}/weapi/feedback/weblog`,
        data: {
            logs: JSON.stringify(logs),
        }
    });
}

export function submitCount() {
    return client.post({
        url: `${BaseURL}/weapi/pl/count`,
        data: {}
    });
}

/**
 * tell netease I've finished listening a song
 * @param {number} id
 * @param {number} time song duration
 */
export function submitListened(id, time) {
    return submitWebLog('play', {
        id,
        type: 'song',
        wifi: 0,
        download: 0,
        time: Math.round(time),
        end: 'ui',
    });
}

export function getVipInfo() {
    return client.post({
        url: `${BaseURL}/weapi/music-vip-membership/front/vip/info`,
        data: {}
    });
}

export function getDirSize(dirPath) {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const stat = fs.statSync(path.join(dirPath, file));
        if (stat.isFile()) {
            totalSize += stat.size;
        } else if (stat.isDirectory) {
            totalSize += getDirSize(path.join(dirPath, file));
        }
    });
    return totalSize;
}

export function removeDir(dirPath) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
            fs.unlinkSync(fullPath);
        } else if (stat.isDirectory) {
            removeDir(fullPath);
        }
    });
}

/**
 * get size of cached data in bytes
 * @param {'all'|'music'|'lyric'} type cache type, default to `all`
 */
export function getDataSize(type = 'all') {
    const cachePath = cachePathMap[type];
    let size;
    try {
        size = getDirSize(cachePath);
    } catch (err) {
        size = 0;
    }
    return size;
}

export function clearCache(type) {
    try {
        removeDir(cachePathMap[type]);
    } catch (err) {
        return {
            errno: -1,
            err
        };
    }
    return true;
}

/**
 * @returns {string}
 */
export function getVersionName() {
    let version = Settings.appVer;
    if (process.env.NODE_ENV === 'development') {
        version += '-hot';
        let rev = '';
        try {
            rev = cp.execSync('git rev-parse --short HEAD').toString().trim();
            version += `.${rev}+`;
            // eslint-disable-next-line no-empty
        } catch (err) { }
    }
    return version;
}

/**
 * @returns {Promise<Types.Settings>}
 */
export function getCurrentSettings() {
    return Settings.getCurrent();
}

/**
 * write and save settings to file
 * @param {Types.Settings} target settings to write
 */
export function writeSettings(target) {
    Settings.set(target);
}

export function resetSettings() {
    Settings.set(Settings.defaultSettings);
}

/**
 * 每日签到
 * @param {0|1} type `0`:移动端, `1`:桌面/网页端
 * @returns {Promise<Types.DailyTaskRes>}
 */
export function postDailyTask(type) {
    return client.post({
        url: `${BaseURL}/weapi/point/dailyTask`,
        data: { type }
    });
}

/**
 * add or remove tracks in playlist
 * @param {'add'|'del'} op opreation
 * @param {number} pid playlist id
 * @param {number[]} tracks track id
 */
export function manipulatePlaylistTracks(op, pid, tracks) {
    return client.post({
        url: `${BaseURL}/weapi/playlist/manipulate/tracks`,
        data: {
            op,
            pid,
            // tracks,
            trackIds: JSON.stringify(tracks),
        }
    });
}

/**
 * add tracks to playlist
 * @param {number} pid playlist id
 * @param  {number[]} tracks track to add
 */
export function collectTrack(pid, ...tracks) {
    return manipulatePlaylistTracks('add', pid, tracks);
}

/**
 * remove tracks from playlist
 * @param {number} pid playlist id
 * @param  {number[]} tracks track to remove
 */
export function uncollectTrack(pid, ...tracks) {
    return manipulatePlaylistTracks('del', pid, tracks);
}

export function getSearchSuggest(s) {
    return client.post({
        url: `${BaseURL}/weapi/search/suggest/web`,
        data: { s }
    });
}

const searchTypeMap = {
    song: '1',
    album: '10',
    artist: '100',
    playlist: '1000',
    user: '1002',
    mv: '1004',
    lyric: '1006',
    radio: '1009'
};

/**
 * preform search
 * @param {string} s keyword
 * @param {'song'|'album'|'artist'|'playlist'|'user'|'mv'|'lyric'|'radio'} type
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Types.SearchRes>}
 */
export function search(s, type, limit = 20, offset = 0) {
    return client.post({
        url: `${BaseURL}/weapi/cloudsearch/get/web`,
        data: {
            hlposttag: '</span>',
            hlpretag: '<span class="s-fc7">',
            limit,
            offset,
            s,
            total: true,
            type: searchTypeMap[type],
        }
    });
}

export function subscribePlaylist(id) {
    return client.post({
        url: `${BaseURL}/weapi/playlist/subscribe`,
        data: { id }
    });
}

export function unsubscribePlaylist(id) {
    return client.post({
        url: `${BaseURL}/weapi/playlist/unsubscribe`,
        data: { id }
    });
}

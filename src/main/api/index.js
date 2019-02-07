import fs from 'fs';
import url from 'url';
import path from 'path';
import crypto from 'crypto';
import qs from 'querystring';
import cp from 'child_process';
import { app } from 'electron';

import { Lrc } from 'lrc-kit';

import Cache from './cache';
import Client from './httpClient';
import * as Settings from '../settings';
import MusicServer from './musicServer';

const fsPromises = fs.promises;
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
        return client.postW({
            url: `${BaseURL}/weapi/login/cellphone`,
            data: { phone: acc, ...postBody }
        });
    } else {
        return client.postW({
            url: `${BaseURL}/weapi/login`,
            data: { username: acc, ...postBody }
        });
    }
}

export function refreshLogin() {
    return client.postW({
        url: `${BaseURL}/weapi/login/token/refresh`,
        data: {}
    });
}

export async function logout() {
    const resp = await client.postW({ url: `${BaseURL}/logout` });
    if (resp.code === 200) {
        client.updateCookie();
    }
    return resp.code;
}

/**
 * @param {number} uid
 * @returns {Promise<Types.UserPlaylistRes>}
 */
export function getUserPlaylist(uid) {
    return client.postW({
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
    return client.postW({
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
    return client.postW({
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
 * @param {number} id
 * @returns {Promise<Types.DislikeRecommendRes>}
 */
export function dislikeRecommend(id) {
    return client.postW({
        url: `${BaseURL}/weapi/v2/discovery/recommend/dislike`,
        data: {
            resId: id,
            resType: 4,
            sceneType: 1
        }
    });
}

/**
 * 推荐歌单，登录后可用
 * @returns {Types.RecommendPlaylistRes}
 */
export function getRecommendPlaylist() {
    return client.postW({
        url: `${BaseURL}/weapi/v1/discovery/recommend/resource`,
        data: {}
    });
}

/**
 * 推荐歌单 -> 不感兴趣
 * @param {number} id
 * @param {'bysong_rt'|'hotbased'} alg `bysong_rt`: 根据收藏的单曲推荐, `hotbased`: 热门推荐
 */
export function dislikePlaylist(id, alg) {
    return client.postW({
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
    return client.postW({
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
    return client.postW({
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
    return client.postL({
        url: `${BaseURL}/api/linux/forward`,
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
 * music url, eapi
 * @param {number|number[]} idOrIds
 * @param {Types.MusicQuality} quality
 * @returns {Promise<Types.MusicUrlRes>}
 */
export function getMusicUrlE(idOrIds, quality) {
    if (!QualityMap[quality]) throw new Error(`Quality type '${quality}' is not in [h,m,l]`);
    let ids;
    if (Array.isArray(idOrIds)) ids = idOrIds;
    else ids = [idOrIds];
    return client.postE({
        url: `${BaseURL}/eapi/song/enhance/player/url`,
        data: {
            ids,
            br: QualityMap[quality],
        }
    });
}

/**
 * get musicServer's music url
 * @param {number} id
 * @param {Types.MusicQuality} quality
 * @param {boolean} cache
 * @returns {Types.MusicUrlLocalRes}
 */
export async function getMusicUrlLocal(id, quality, ignoreCache = false) {
    return {
        url: url.format({
            protocol: 'http:',
            hostname: 'localhost',
            port: musicServerPort,
            pathname: '/music',
            query: ignoreCache ? { id, quality, ignoreCache } : { id, quality }
        })
    };
}

const Comments = {
    threadRegexp: /^\w_\w\w_(?<resType>\d{1,2})_(?<rid>\w+)$/
};

/**
 * get comments by thread id
 * @param {string} thread
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Types.CommentsRes>}
 */
export function getComments(thread, limit = 20, offset = 0) {
    const { rid } = thread.match(Comments.threadRegexp).groups;
    return client.postW({
        url: `${BaseURL}/weapi/v1/resource/comments/${thread}`,
        data: { rid, offset, limit }
    });
}

/**
 * get hot comments by thread id
 * @param {string} thread
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Types.HotCommentsRes>}
 */
export function getHotComments(thread, limit = 20, offset = 0) {
    const { rid } = thread.match(Comments.threadRegexp).groups;
    return client.postW({
        url: `${BaseURL}/weapi/v1/resource/hotcomments/${thread}`,
        data: { rid, offset, limit }
    });
}

/**
 * **DO NOT USE**
 * @param {string} threadId
 * @param {number} commentId
 * @returns {Promise<Types.LikeCommentRes>}
 */
export function likeComment(threadId, commentId) {
    return client.postW({
        url: `${BaseURL}/weapi/v1/comment/like`,
        data: { threadId, commentId }
    });
}

/**
 * @param {string} threadId
 * @param {number} commentId
 * @returns {Promise<Types.ApiRes>}
 */
export function unlikeComment(threadId, commentId) {
    return client.postW({
        url: `${BaseURL}/weapi/v1/comment/unlike`,
        data: { threadId, commentId }
    });
}

/**
 * @param {string} threadId
 * @param {number} commentId
 * @returns {Promise<Types.ApiRes>}
 */
export function likeCommentE(threadId, commentId) {
    return client.postE({
        url: `${BaseURL}/eapi/v1/comment/like`,
        data: { threadId, commentId }
    });
}

/**
 * @param {string} threadId
 * @param {number} commentId
 * @returns {Promise<Types.ApiRes>}
 */
export function unlikeCommentE(threadId, commentId) {
    return client.postE({
        url: `${BaseURL}/eapi/v1/comment/unlike`,
        data: { threadId, commentId }
    });
}

/**
 * post comment to thread
 * @param {string} threadId
 * @param {string} content
 * @returns {Promise<Types.AddCommentRes>}
 */
export function addComment(threadId, content) {
    return client.postW({
        url: `${BaseURL}/weapi/resource/comments/add`,
        data: { threadId, content }
    });
}

/**
 * delete comment from thread
 * @param {string} threadId
 * @param {number} commentId
 * @returns {Types.ApiRes}
 */
export function deleteComment(threadId, commentId) {
    return client.postW({
        url: `${BaseURL}/weapi/resource/comments/delete`,
        data: { threadId, commentId }
    });
}

/**
 * **DO NOT USE**
 * @param {string} threadId
 * @param {number} commentId
 * @param {string} content
 * @returns {Types.AddCommentRes}
 */
export function replyComment(threadId, commentId, content) {
    return client.postW({
        url: `${BaseURL}/api/v1/resource/comments/reply`,
        data: { threadId, commentId, content /* checkToken */ }
    });
}

/**
 * @param {string} threadId
 * @param {number} commentId
 * @param {string} content
 * @returns {Types.AddCommentRes}
 */
export function replyCommentE(threadId, commentId, content) {
    const { resType: resourceType } = threadId.match(Comments.threadRegexp).groups;
    return client.postE({
        url: `${BaseURL}/eapi/v1/resource/comments/reply`,
        data: { threadId, commentId, content, resourceType }
    });
}

const MusicLyric = {
    byTimestamp(a, b) {
        return a.timestamp - b.timestamp;
    }
};

/**
 * @param {number} id
 * @returns {Promise<Types.MusicLyricRes>}
 */
export async function getMusicLyric(id) {
    const tmp = await client.postW({
        url: `${BaseURL}/weapi/song/lyric`,
        data: {
            id,
            lv: -1,
            tv: -1
        }
    });
    let result = {};
    if (tmp.lrc && tmp.lrc.lyric) {
        const lrc = Lrc.parse(tmp.lrc.lyric);
        if (lrc.lyrics.length > 0) {
            lrc.lyrics.sort(MusicLyric.byTimestamp);
            result.lrc = lrc;
        } else {
            result.txtLyric = tmp.lrc.lyric;
        }
        result.lyricUser = tmp.lyricUser;
    }
    if (tmp.tlyric && tmp.tlyric.lyric) {
        result.transUser = tmp.transUser;
        let tlrc = Lrc.parse(tmp.tlyric.lyric);
        tlrc.lyrics.sort(MusicLyric.byTimestamp);
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
 * @param {boolean} ignoreCache
 * @returns {Promise<Types.MusicLyricRes>}
 */
export async function getMusicLyricCached(id, ignoreCache = false) {
    const hasCache = await lyricCache.has(id);
    if (hasCache && !ignoreCache) {
        const pathname = lyricCache.fullPath(id);
        const text = await fsPromises.readFile(pathname, 'utf8');
        return JSON.parse(text);
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
    return client.postW({
        url: `${BaseURL}/weapi/log/web`,
        data: {
            action,
            json: JSON.stringify(json),
        }
    });
}

/**
 * @param {any} logs
 * @returns {Promise<Types.ApiRes>}
 */
export function sumbitFeedback(logs) {
    return client.postW({
        url: `${BaseURL}/weapi/feedback/weblog`,
        data: {
            logs: JSON.stringify(logs),
        }
    });
}

export function submitCount() {
    return client.postW({
        url: `${BaseURL}/weapi/pl/count`,
        data: {}
    });
}

/**
 * tell netease I've finished listening a song
 * @param {number} id
 * @param {number} time song duration, in seconds
 * @param {{name: string; id: string}} source
 */
export function submitListened(id, time, source) {
    let json = {
        type: 'song',
        wifi: 0,
        download: 0,
        id,
        time: Math.floor(time),
        end: 'ui'
    };
    if (source && source.id && source.name) {
        json.source = source.name;
        json.sourceId = `${source.id}`;
    }
    return sumbitFeedback([{ action: 'play', json }]);
}

export function getVipInfo() {
    return client.postW({
        url: `${BaseURL}/weapi/music-vip-membership/front/vip/info`,
        data: {}
    });
}

/**
 * get disk usage of file or directory
 * @param {string} pathname
 * @returns {Promise<number>}
 */
export function getDiskUsage(pathname) {
    return new Promise((resolve, reject) => {
        fsPromises.lstat(pathname).then(stat => {
            if (stat.isSymbolicLink() || stat.isFile()) {
                resolve(stat.size);
            } else if (stat.isDirectory()) {
                fsPromises.readdir(pathname).then(files => {
                    const p = files.map(file => getDiskUsage(path.join(pathname, file)));
                    Promise.all(p).then(sizes => {
                        const tot = sizes.reduce((a, b) => a + b, 0);
                        resolve(tot);
                    }).catch(reject);
                });
            }
        }).catch(reject);
    });
}

export function removeRecursive(pathname) {
    return new Promise((resolve, reject) => {
        fsPromises.lstat(pathname).then(stat => {
            if (stat.isSymbolicLink() || stat.isFile()) {
                fsPromises.unlink(pathname).then(resolve).catch(reject);
            } else if (stat.isDirectory()) {
                fsPromises.readdir(pathname).then(files => {
                    const p = files.map(file => removeRecursive(path.join(pathname, file)));
                    Promise.all(p).then(resolve).catch(reject);
                });
            }
        }).catch(reject);
    });
}

/**
 * get size of cached data in bytes
 * @param {'all'|'music'|'lyric'} type cache type
 * @returns {Promise<{ok: boolean; size: number; msg?: string}>}
 */
export async function getDataSize(type) {
    const cachePath = cachePathMap[type];
    try {
        const size = await getDiskUsage(cachePath);
        return { ok: true, size };
    } catch (e) {
        console.error(e); // eslint-disable-line no-console
        return {
            ok: false,
            size: 0,
            msg: e.stack
        };
    }
}

/**
 * @param {'all'|'music'|'lyric'} type cache type
 * @returns {Promise<{ok: boolean; msg?: string}>}
 */
export async function clearCache(type) {
    try {
        await removeRecursive(cachePathMap[type]);
    } catch (e) {
        return {
            ok: false,
            msg: e.stack
        };
    }
    return { ok: true };
}

function execAsync(...args) {
    return new Promise((resolve, reject) => {
        cp.exec(...args, (err, stdout, stderr) => {
            if (err) {
                reject({ stderr, stack: err.stack });
                return;
            }
            resolve(stdout.trim());
        });
    });
}

/**
 * @returns {Promise<string>}
 */
export async function getVersionName() {
    let version = Settings.appVer;
    if (process.env.NODE_ENV === 'development') {
        try {
            const hash = await execAsync('git rev-parse --short HEAD');
            return `${version}-git.${hash}.dev`;
        } catch (e) {
            return `${version}.dev`;
        }
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
    return client.postW({
        url: `${BaseURL}/weapi/point/dailyTask`,
        data: { type }
    });
}

/**
 * eapi 签到
 * @param {0|1} type `0`:移动端, `1`:桌面/网页端
 * @param {number} adid
 * @returns {Promise<Types.DailyTaskRes>}
 */
export function postDailyTaskE(type, adid = 0) {
    return client.postE({
        url: `${BaseURL}/eapi/point/dailyTask`,
        data: { type, adid }
    });
}

/**
 * 获取签到状态
 * @returns {Promise<Types.GetDailyTaskRes>}
 */
export function getDailyTask() {
    return client.postW({
        url: `${BaseURL}/weapi/point/getDailyTask`
    });
}

/**
 * add or remove tracks in playlist
 * @param {'add'|'del'} op opreation
 * @param {number} pid playlist id
 * @param {number[]} tracks track id
 */
export function manipulatePlaylistTracks(op, pid, tracks) {
    return client.postW({
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

/**
 * @param {string} s keyword
 * @returns {Promise<Types.SearchSuggestRes>}
 */
export function getSearchSuggest(s) {
    return client.postW({
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
    radio: '1009',
    video: '1014'
};

/**
 * preform search
 * @param {string} s keyword
 * @param {'song'|'album'|'artist'|'playlist'|'user'|'mv'|'lyric'|'radio'|'video'} type
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Types.SearchRes>}
 */
export function search(s, type, limit = 20, offset = 0) {
    return client.postW({
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
    return client.postW({
        url: `${BaseURL}/weapi/playlist/subscribe`,
        data: { id }
    });
}

export function unsubscribePlaylist(id) {
    return client.postW({
        url: `${BaseURL}/weapi/playlist/unsubscribe`,
        data: { id }
    });
}

/**
 * @param {number} limit defalut to `25`
 * @param {number} offset default to `0`
 * @returns {Promise<Types.SubscribedArtistRes>}
 */
export function getSubscribedArtists(limit = 25, offset = 0) {
    return client.postW({
        url: `${BaseURL}/weapi/artist/sublist`,
        data: {
            limit,
            offset
        }
    });
}

/**
 * @param {number} limit defalut to `25`
 * @param {number} offset default to `0`
 * @returns {Promise<Types.FavoriteVideoRes>}
 */
export function getFavoriteVideos(limit = 25, offset = 0) {
    return client.postW({
        url: `${BaseURL}/weapi/cloudvideo/allvideo/sublist`,
        data: {
            limit,
            offset
        }
    });
}

/**
 * @param {number} limit defalut to `25`
 * @param {number} offset default to `0`
 * @returns {Promise<Types.SubscribedAlbumRes>}
 */
export function getSubscribedAlumbs(limit = 25, offset = 0) {
    return client.postE({
        url: `${BaseURL}/eapi/album/sublist`,
        data: {
            limit,
            offset
        }
    });
}

/**
 * album detail, weapi
 * @param {number|string} id
 * @returns {Promise<Types.AlbumDetailWRes>}
 */
export function getAlbumDetailW(id) {
    return client.postW({
        url: `${BaseURL}/api/v1/album/${id}`,
        data: {
            total: true,
            offset: 0,
            id: id,
            limit: 1000,
            ext: true,
            private_cloud: true
        }
    });
}

/**
 * **DO NOT USE** album detail, eapi.
 * @param {number|string} id
 * @returns {Promise<Types.AlbumDetailRes>}
 */
export function getAlbumDetailE(id) {
    return client.postE({
        url: `${BaseURL}/eapi/album/v3/detail`,
        data: {
            id: `${id}`,
            // TODO: find out what is this `cache_key`
            cache_key: crypto.randomFillSync(Buffer.alloc(32)).toString('base64')
        }
    });
    /**
     * it seems that `cache_key` is only related to album id
     * 35864444 BA06KMtT+Jm5DZSrXsuZ0jGEx2migzblBUw9lQhLRk8=
     * 71853061 A8n1QcV7AJngH5IqI6PCRh6+VMaxh6RGw+7gM294MTA=
     */
}

/**
 * @param {number|string} id
 * @returns {Promise<Types.AlbumDynamicDetailRes>}
 */
export function getAlbumDynamicDetail(id) {
    return client.postE({
        url: `${BaseURL}/eapi/album/detail/dynamic?id=${id}`,
        data: { id: `${id}` }
    });
}

/**
 * @param {number|string} id
 * @returns {Promise<Types.AlbumPrivilegeRes>}
 */
export function getAlbumPrivilege(id) {
    return client.postE({
        url: `${BaseURL}/eapi/album/privilege?id=${id}`,
        data: { id: `${id}` }
    });
}

// utils for api `getRelatedPlaylists`
const RelatedPlaylists = {
    regexp: /<div class="cver u-cover u-cover-3">[\s\S]*?title="(.+)"\ndata-res-id="(\d+)"[\s\S]*?<img src="(.+)"[\s\S]*?<a class="nm nm f-thide s-fc3" href="(.+)" title="(.+)">/g,
    trimSrc(u) {
        const o = url.parse(u);
        return url.format({
            protocol: 'https',
            host: o.host,
            pathname: o.pathname
        });
    },
    trimId(u) {
        const o = url.parse(u);
        return qs.parse(o.query).id;
    }
};

/**
 * get playlists related to given playlist
 * @param {number} id
 * @returns {Promise<Types.RelatedPlaylistsRes>}
 */
export async function getRelatedPlaylists(id) {
    const html = await client.get(`${BaseURL}/playlist?id=${id}`);
    const data = [];
    try {
        let match;
        while (match = RelatedPlaylists.regexp.exec(html)) { // eslint-disable-line no-cond-assign
            data.push({
                name: match[1],
                id: match[2],
                picUrl: RelatedPlaylists.trimSrc(match[3]),
                creator: {
                    id: RelatedPlaylists.trimId(match[4]),
                    name: match[5]
                }
            });
        }
        return { code: 200, data };
    } catch (e) {
        return { code: 500, error: e.stack };
    }
}

const RecommendStatistics = {
    regexp: /你播放了[\s\S]*?(\d+)<\/strong>首音乐[\s\S]*?你喜欢了[\s\S]*?(\d+)<\/strong>首音乐[\s\S]*?你收藏了[\s\S]*?(\d+)<\/strong>位歌手/
};

export async function getRecommendStatistics() {
    const html = await client.get(`${BaseURL}/discover/recommend/taste`);
    try {
        const match = RecommendStatistics.regexp.exec(html);
        return {
            code: 200,
            data: {
                playCnt: +match[1],
                likeCnt: +match[2],
                followCnt: +match[3]
            }
        };
    } catch (e) {
        return { code: 500, error: e.stack };
    }
}

const RelatedAlbums = {
    regexp: /<div class="cver u-cover u-cover-3">\n<a href="(.+)" title="(.+)">\n<img src="(.+)">[\s\S]*?<p class="s-fc3">([\d-]+)<\/p>/g
};

/**
 * get album related to given album
 * @param {number} id
 * @returns {Promise<Types.RelatedAlbumsRes>}
 */
export async function getRelatedAlbums(id) {
    const html = await client.get(`${BaseURL}/album?id=${id}`);
    const data = [];
    try {
        let match;
        while (match = RelatedAlbums.regexp.exec(html)) { // eslint-disable-line no-cond-assign
            data.push({
                id: RelatedPlaylists.trimId(match[1]),
                name: match[2],
                picUrl: RelatedPlaylists.trimSrc(match[3]),
                publishDate: match[4]
            });
        }
        return { code: 200, data };
    } catch (e) {
        return { code: 500, error: e.stack };
    }
}

/**
 * @param {string} id
 * @returns {Promise<Types.SubscribeAlbumRes>}
 */
export function subscribeAlbum(id) {
    return client.postE({
        url: `${BaseURL}/eapi/album/sub`,
        data: { id: `${id}` }
    });
}

/**
 * @param {string} id
 * @returns {Promise<Types.UnsubscribeAlbumRes>}
 */
export function unsubscribeAlbum(id) {
    return client.postE({
        url: `${BaseURL}/eapi/album/unsub`,
        data: { id: `${id}` }
    });
}

/**
 * 推荐 MV
 * @returns {Promise<Types.RecommendMVRes>}
 */
export function getRecommendMVs() {
    return client.postW({
        url: `${BaseURL}/weapi/personalized/mv`,
        data: {}
    });
}

/**
 * 推荐歌单，包含前两个固定的编辑推荐，不登录也能用
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Types.PersonalizedPlaylistRes>}
 */
export function getPersonalizedPlaylists(limit = 10, offset = 0) {
    return client.postW({
        url: `${BaseURL}/weapi/personalized/playlist`,
        data: {
            limit,
            offset,
            total: true,
            n: 1000
        }
    });
}

/**
 * **DO NOT USE** artist detail, eapi.
 * @param {number|string} id
 * @returns {Promise<Types.ArtistDetailERes>}
 */
export function getArtistDetailE(id) {
    return client.postE({
        url: `${BaseURL}/eapi/artist/v3/detail`,
        data: { id: `${id}`, top: '50' },
        cache_key: ''
    });
}

/**
 * @param {number|string} id
 * @returns {Promise<Types.AritstDetailWRes>}
 */
export function getArtistDetailW(id) {
    return client.postW({
        url: `${BaseURL}/weapi/artist/${id}`
    });
}

/**
 * @param {number|string} id
 * @returns {Promise<Types.ArtistDynamicDetailRes>}
 */
export function getArtistDynamicDetail(id) {
    return client.postE({
        url: `${BaseURL}/eapi/artist/detail/dynamic`,
        data: { id: `${id}` }
    });
}

/**
 * @param {number|string} artistId
 * @returns {Promise<{Types.ApiRes}>}
 */
export function followArtist(artistId) {
    return client.postW({
        url: `${BaseURL}/weapi/artist/sub`,
        data: {
            artistId,
            artistIds: `[${artistId}]`
        }
    });
}

/**
 * @param {number|string} artistId
 * @returns {Promise<Types.ApiRes>}
 */
export function unfollowArtist(artistId) {
    return client.postW({
        url: `${BaseURL}/weapi/artist/unsub`,
        data: {
            artistId,
            artistIds: `[${artistId}]`
        }
    });
}

/**
 * @param {number} id
 * @param {number} offset
 * @param {number} limit
 * @returns {Promise<Types.ArtistAlbumsRes>}
 */
export function getArtistAlbums(id, offset = 0, limit = 30) {
    return client.postW({
        url: `${BaseURL}/weapi/artist/albums/${id}`,
        data: {
            offset,
            limit,
            total: true
        }
    });
}

/**
 * @param {number} artistId
 * @param {number} offset
 * @param {number} limit
 * @returns {Promise<Types.ArtistMVsRes>}
 */
export function getArtistMVs(artistId, offset = 0, limit = 30) {
    return client.postW({
        url: `${BaseURL}/weapi/artist/mvs`,
        data: {
            artistId,
            offset,
            limit,
            total: true
        }
    });
}

/**
 * @param {number} id
 * @returns {Promise<Types.ArtistIntroRes>}
 */
export function getArtistIntro(id) {
    return client.postW({
        url: `${BaseURL}/weapi/artist/introduction`,
        data: { id }
    });
}

/**
 * @param {number} id
 * @returns {Promise<Types.MVDetailRes>}
 */
export function getMVDetail(id) {
    return client.postW({
        url: `${BaseURL}/weapi/mv/detail`,
        data: { id }
    });
}

/**
 * @param {string} id
 * @returns {Promise<Types.SubscribeMVRes>}
 */
export function subscribeMV(mvId) {
    return client.postW({
        url: `${BaseURL}/weapi/mv/sub`,
        data: {
            mvId,
            mvIds: `[${mvId}]`
        }
    });
}

/**
 * @param {string} id
 * @returns {Promise<Types.UnsubscribeMVRes>}
 */
export function unsubscribeMV(mvId) {
    return client.postW({
        url: `${BaseURL}/weapi/mv/unsub`,
        data: {
            mvId,
            mvIds: `[${mvId}]`
        }
    });
}

/**
 * @param {number} id
 * @returns {Promise<Types.VideoDetailRes>}
 */
export function getVideoDetail(id) {
    return client.postW({
        url: `${BaseURL}/weapi/cloudvideo/v1/video/detail`,
        data: { id }
    });
}

/**
 * @param {string} id
 * @returns {Promise<Types.SubscribeVideoRes>}
 */
export function subscribeVideo(id) {
    return client.postW({
        url: `${BaseURL}/weapi/cloudvideo/video/sub`,
        data: { id }
    });
}

/**
 * @param {string} id
 * @returns {Promise<Types.UnsubscribeVideoRes>}
 */
export function unsubscribeVideo(id) {
    return client.postW({
        url: `${BaseURL}/weapi/cloudvideo/video/unsub`,
        data: { id }
    });
}

/**
 * @param {string} id
 * @returns {Promise<Types.VideoStatisticRes>}
 */
export function getVideoStatistic(id) {
    return client.postW({
        url: `${BaseURL}/weapi/cloudvideo/v1/video/statistic`,
        data: { id }
    });
}

/**
 * @param {number} id
 * @param {number} resolution
 * @returns {Promise<Types.VideoURLRes>}
 */
export function getVideoURL(id, resolution = 1080) {
    return client.postW({
        url: `${BaseURL}/weapi/cloudvideo/playurl`,
        data: {
            ids: `["${id}"]`,
            resolution
        }
    });
}

/**
 * 评论/赞/分享总数以及是否赞过
 * @param {string} threadid
 * @returns {Promise<Types.CommentThreadInfoERes>}
 */
export function getCommentThreadInfoE(threadid) {
    return client.postE({
        url: `${BaseURL}/eapi/comment/commentthread/info`,
        data: {
            threadid,
            composeliked: 'true'
        }
    });
}

/**
 * @param {string} threadId
 * @returns {Promise<Types.ApiRes>}
 */
export function likeResourceE(threadId) {
    return client.postE({
        url: `${BaseURL}/eapi/resource/like`,
        data: { threadId }
    });
}

/**
 * @param {string} threadId
 * @returns {Promise<Types.ApiRes>}
 */
export function unlikeResourceE(threadId) {
    return client.postE({
        url: `${BaseURL}/eapi/resource/unlike`,
        data: { threadId }
    });
}

/**
 * @param {string} threadId
 * @returns {Promise<Types.ApiRes>}
 */
export function likeResource(threadId) {
    return client.postW({
        url: `${BaseURL}/weapi/resource/like`,
        data: { threadId }
    });
}

/**
 * @param {string} threadId
 * @returns {Promise<Types.ApiRes>}
 */
export function unlikeResource(threadId) {
    return client.postW({
        url: `${BaseURL}/weapi/resource/unlike`,
        data: { threadId }
    });
}

/**
 * @returns {Promise<Types.RadioRes>}
 */
export function getRadio() {
    return client.postW({
        url: `${BaseURL}/weapi/v1/radio/get`,
        data: {}
    });
}

/**
 * @param {number} songId
 * @param {number} time
 * @returns {Promise<Types.DislikeRadioSongRes>}
 */
export function dislikeRadioSong(songId, time) {
    const query = qs.stringify({ alg: 'RT', songId, time });
    return client.postW({
        url: `${BaseURL}/weapi/radio/trash/add?${query}`,
        data: { songId }
    });
}

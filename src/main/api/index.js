import path from 'node:path';
import crypto from 'node:crypto';
import qs from 'node:querystring';

import { app } from 'electron';

import { Lrc } from 'lrc-kit';
import { decodeHTML } from 'entities';
import debug from 'debug';
import match from '@unblockneteasemusic/server';

import Cache from './cache';
import migrate from './migrate';
import HttpClient from './httpClient';
import { encodePicUrl } from './codec';
import * as Settings from '../settings';
import MusicServer from './musicServer';
import { getDiskUsage, clearDirectory } from '../util/fs';
import Downloader from './downloader';

const d = debug('API');
const BaseURL = 'https://music.163.com';
const client = new HttpClient();

const dataPath = app.getPath('userData');
const cachePath = app.getPath('cache');
const CachePath = {
    all: dataPath,
    music: path.join(cachePath, 'electron-netease-cloud-music' ,'musicCache')
};
const musicCache = new Cache(CachePath.music, dataPath);
migrate();

const musicServer = new MusicServer(musicCache);
let musicServerPort = 0;
musicServer.listen().then(addr => musicServerPort = addr.port);

const downloader = new Downloader(musicCache);

/**
 * clear all cookies, and set cookie as given arguments
 * @param {Record<string, string>} [cookie]
 */
export function updateCookie(cookie) {
    client.updateCookie(cookie);
}

/**
 * @param {string} [key]
 * @returns {string | Record<string, string>}
 */
export function getCookie(key) {
    return client.getCookie(key);
}

/**
 * @param {string} acc email, username or phone
 * @param {string} pwd password
 * @param {string} countrycode phone country code, default to `'86'`
 * @returns {Promise<Types.LoginRes>}
 */
export function login(acc, pwd, countrycode = '86') {
    const password = crypto.createHash('md5').update(pwd).digest('hex');
    const postBody = {
        password,
        remember: true,
        type: 0,
        https: true
    };
    if (/^\d*$/.test(acc)) {
        postBody.type = 1;
        return client.postE('/w/login/cellphone', { phone: acc, countrycode, ...postBody }, false, true);
    } else {
        postBody.type = 0;
        return client.postE('/w/login', { username: acc, ...postBody }, false, true);
    }
}

/**
 * 获取扫码登录 key
 * @param {number} [type = 1]
 * @returns {Promise<Types.QRCodeUnikeyRes>}
 */
export function getQRLoginKey(type = 3) {
    return client.postE('/login/qrcode/unikey', { type });
}

/**
 * 检查扫码登录状态
 * - `800` 二维码过期
 * - `801` 等待扫码
 * - `802` 授权中
 * - `803` 授权登录成功
 * @param {string} key
 * @param {number} [type = 1]
 */
export function checkQRLoginStatus(key, type = 1) {
    return client.postE('/login/qrcode/client/login', { key, type });
}

/**
 * @returns {Promise<Types.ApiRes>}
 */
export function refreshLogin() {
    return client.postE('/login/token/refresh');
}

export async function logout() {
    const resp = await client.postE('/logout');
    if (resp.code === 200) {
        client.updateCookie();
    }
    return resp.code;
}

/**
 * @param {string} id
 * @param {string} captcha
 * @returns {Promise<Types.VerifyCaptchaRes>}
 */
export function verifyCaptcha(id, captcha) {
    return client.postW('/image/captcha/verify/hf', { id, captcha });
}

/**
 * @returns {Promise<Types.MyProfileRes>}
 */
export function getMyProfile() {
    return client.postE('/nuser/account/get');
}

/**
 * @param {number} uid
 * @returns {Promise<Types.UserPlaylistRes>}
 */
export function getUserPlaylists(uid) {
    return client.postE('/user/playlist', {
        uid,
        offset: 0,
        limit: 1000,
    });
}

/**
 * 用户听歌记录
 * @param {number} uid
 * @param {0 | 1} type 0: 所有时间; 1: 最近一周
 * @returns {Promise<Types.UserPlayRecordRes>}
 */
export function getUserPlayRecord(uid, type = 0) {
    return client.postE('/v1/play/record', {
        limit: 1000,
        offset: 0,
        total: true,
        type,
        uid,
    });
}

/**
 * 每日歌曲推荐
 * @returns {Promise<Types.RecommendSongsRes>}
 */
export function getRecommendSongs() {
    return client.postE('/v2/discovery/recommend/songs', {
        limit: 20,
        offset: 0,
        total: true
    });
}

/**
 * 每日歌曲推荐 -> 不感兴趣
 * @param {number} id
 * @returns {Promise<Types.DislikeRecommendRes>}
 */
export function dislikeRecommend(id) {
    return client.postE('/v2/discovery/recommend/dislike', {
        resId: id,
        resType: 4,
        sceneType: 1
    });
}

/**
 * 推荐歌单，登录后可用
 * @returns {Promise<Types.RecommendPlaylistRes>}
 */
export function getRecommendPlaylist() {
    return client.postE('/v1/discovery/recommend/resource');
}

/**
 * 推荐歌单 -> 不感兴趣
 * @param {number} id
 * @param {'bysong_rt'|'hotbased'} alg `bysong_rt`: 根据收藏的单曲推荐, `hotbased`: 热门推荐
 */
export function dislikePlaylist(id, alg) {
    return client.postE('/v2/discovery/recommend/dislike', {
        resId: id,
        resType: 1,
        type: alg
    });
}

/**
 * 包含歌曲列表的歌单详情，最多能获取前 1000 首，不能分页
 * @param {number} id
 * @param {number} [n=1000] 歌曲详情的数量，默认为 `1000`
 * @returns {Promise<Types.ListDetailRes>}
 */
export function getListDetail(id, n = 1000) {
    return client.postE('/v3/playlist/detail', { id, n });
}

/**
 * 包含歌曲列表的歌单详情，最多能获取前 1000 首，不能分页
 * @param {number} id
 * @param {number} [n=1000] 歌曲详情的数量，默认为 `1000`
 * @returns {Promise<Types.ListDetailRes>}
 */
export function getListDetailE(id, n = 1000) {
    return client.postE('/v3/playlist/detail', { id, n });
}

/**
 * 批量查询歌曲详情, 最多 1000 首
 * @param {number[]} ids
 * @returns {Promise<Types.SongDetailRes>}
 */
export function getSongDetail(ids) {
    return client.postE('/v3/song/detail', {
        c: `[${ids.map(id => JSON.stringify({ id }))}]`,
        // ids: `[${ ids }]`
    });
}

/**
 * 通过 pic 获取 picUrl
 * @param {number | string} id
 * @param {1|2|3|4} cdn
 */
export function getPicUrl(id, cdn = 3) {
    try {
        const hash = encodePicUrl(id);
        return {
            code: 200,
            url: `https://p${cdn}.music.126.net/${hash}/${id}.jpg`
        };
    } catch (e) {
        return {
            code: 500,
            msg: e.message
        };
    }
}

const QualityMap = {
    ex: 999000,
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
export function getMusicUrlW(idOrIds, quality) {
    if (!QualityMap[quality]) throw new Error(`Quality type '${quality}' is not in [ex,h,m,l]`);
    let ids;
    if (Array.isArray(idOrIds)) ids = idOrIds;
    else ids = [idOrIds];
    return client.postW('/song/enhance/player/url', {
        ids,
        br: QualityMap[quality],
    });
}

/**
 * music url with 'linux/forward' api
 * @param {number|number[]} idOrIds
 * @param {Types.MusicQuality} quality
 * @returns {Promise<Types.MusicUrlRes>}
 */
export function getMusicUrlL(idOrIds, quality) {
    if (!QualityMap[quality]) throw new Error(`Quality type '${quality}' is not in [ex,h,m,l]`);
    let ids;
    if (Array.isArray(idOrIds)) ids = idOrIds;
    else ids = [idOrIds];
    return client.postL('/api/song/enhance/player/url', {
        ids,
        br: QualityMap[quality],
    });
}

/**
 * music url, eapi
 * @param {number|number[]} idOrIds
 * @param {Types.MusicQuality} quality
 * @returns {Promise<Types.MusicUrlRes>}
 */
export async function getMusicUrlE(idOrIds, quality) {
    if (!QualityMap[quality]) throw new Error(`Quality type '${quality}' is not in [ex,h,m,l]`);
    let ids;
    if (Array.isArray(idOrIds)) ids = idOrIds;
    else ids = [idOrIds];
    /** @type {Types.MusicUrlRes} */
    let res = await client.postE('/song/enhance/player/url', {
        ids,
        br: QualityMap[quality],
    });
    let canTrial;
    if (res.code !== 200 || res.data[0].code !== 200) {
        canTrial = false;
        d('Cannot get music URL from Netease!');
    } else if (res.data[0].fee === 1 && res.data[0].payed === 0) {
        canTrial = true;
        d("This music requires VIP privillege that we don't have.");
    } else {
        return res;
    }
    try {
        const settings = await Settings.get();
        if (settings.enableUnblock == true) {
            d('Trying get from other source using UnblockNeteaseMusic...');
            const unmData = await match(ids[0], ['qq', 'kugou', 'kuwo']);
            res.data[0].size = unmData.size;
            res.data[0].br = unmData.br;
            res.data[0].url = unmData.url;
            res.data[0].isUnm = true;
        } else {
            throw res;
        }
    } catch (e) {
        if (e instanceof Error) {
            d(`UnblockNeteaseMusic cannot find any fit music source for this music: ${e}`);
        }
        if (canTrial == true) {
            d("Fallback to this music's trial version.");
            res.data[0].isTrial = true;
        } else {
            throw e;
        }
    }
    return res;
}

/**
 * get musicServer's music url
 * @param {number} id
 * @param {Types.MusicQuality} quality
 * @param {boolean} [ignoreCache=false]
 * @returns {Promise<Types.MusicUrlLocalRes>}
 */
export async function getMusicUrlLocal(id, quality, ignoreCache = false) {
    const search = new URLSearchParams({ id, quality });
    if (ignoreCache) {
        search.append(ignoreCache, 'true');
    }
    return {
        url: `http://localhost:${musicServerPort}/music?${search.toString()}`
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
    return client.postW(`/v1/resource/comments/${thread}`, { rid, offset, limit });
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
    return client.postW(`/v1/resource/hotcomments/${thread}`, { rid, offset, limit });
}

/**
 * **DO NOT USE**
 * @param {string} threadId
 * @param {number} commentId
 * @returns {Promise<Types.LikeCommentRes>}
 */
export function likeComment(threadId, commentId) {
    return client.postW('/v1/comment/like', { threadId, commentId });
}

/**
 * @param {string} threadId
 * @param {number} commentId
 * @returns {Promise<Types.ApiRes>}
 */
export function unlikeComment(threadId, commentId) {
    return client.postW('/v1/comment/unlike', { threadId, commentId });
}

/**
 * @param {string} threadId
 * @param {number} commentId
 * @returns {Promise<Types.ApiRes>}
 */
export function likeCommentE(threadId, commentId) {
    return client.postE('/v1/comment/like', { threadId, commentId });
}

/**
 * @param {string} threadId
 * @param {number} commentId
 * @returns {Promise<Types.ApiRes>}
 */
export function unlikeCommentE(threadId, commentId) {
    return client.postE('/v1/comment/unlike', { threadId, commentId });
}

/**
 * post comment to thread
 * @param {string} threadId
 * @param {string} content
 * @returns {Promise<Types.AddCommentRes>}
 */
export function addComment(threadId, content) {
    return client.postW('/resource/comments/add', { threadId, content });
}

/**
 * delete comment from thread
 * @param {string} threadId
 * @param {number} commentId
 * @returns {Promise<Types.ApiRes>}
 */
export function deleteComment(threadId, commentId) {
    return client.postW('/resource/comments/delete', { threadId, commentId });
}

/**
 * @param {string} threadId
 * @param {number} commentId
 * @param {string} content
 * @returns {Promise<Types.AddCommentRes>}
 */
export function replyCommentE(threadId, commentId, content) {
    const { resType: resourceType } = threadId.match(Comments.threadRegexp).groups;
    return client.postE('/v1/resource/comments/reply', { threadId, commentId, content, resourceType });
}

const MusicLyric = {
    byTimestamp(a, b) {
        return a.timestamp - b.timestamp;
    },
    /**
     * merge extra lyric to base
     * @param {Lrc} base 
     * @param {Lrc} extra
     */
    merge(base, extra) {
        extra.lyrics.sort(MusicLyric.byTimestamp);
        const r = base.clone();
        let i = 0;
        let j = 0;
        while (i < r.lyrics.length && j < extra.lyrics.length) {
            if (r.lyrics[i].timestamp === extra.lyrics[j].timestamp) {
                r.lyrics[i].trans = extra.lyrics[j].content;
                i++; j++;
            } else if (r.lyrics[i].timestamp < extra.lyrics[j].timestamp) {
                i++;
            } else {
                j++;
            }
        }
        return r;
    }
};

/**
 * @param {number} id
 * @returns {Promise<Types.MusicLyricRes>}
 */
export async function getMusicLyric(id) {
    const res = await client.postE('/song/lyric', { id, cp: false, lv: 0, tv: 0, kv: 0, rv: 0 });
    let result = {};
    if (res.lrc && res.lrc.lyric) {
        result.lyricUser = res.lyricUser;
        const lrc = Lrc.parse(res.lrc.lyric);
        if (lrc.lyrics.length > 0) {
            lrc.lyrics.sort(MusicLyric.byTimestamp);
            result.lrc = lrc;
        } else {
            result.txtLyric = res.lrc.lyric;
        }
    }
    if (res.tlyric && res.tlyric.lyric) {
        result.transUser = res.transUser;
        const tlrc = Lrc.parse(res.tlyric.lyric);
        result.mlrc = MusicLyric.merge(result.lrc, tlrc);
    }
    if (res.romalrc && res.romalrc.lyric) {
        const romalrc = Lrc.parse(res.romalrc.lyric);
        result.romalrc = MusicLyric.merge(result.lrc, romalrc);
    }
    return result;
}

/**
 * this maybe have been removed, use `sumbitFeedback` instead
 */
export function submitWebLog(action, json) {
    return client.postW('/log/web', {
        action,
        json: JSON.stringify(json),
    });
}

/**
 * @param {any} logs
 * @returns {Promise<Types.ApiRes>}
 */
export function sumbitFeedback(logs) {
    return client.postW('/feedback/weblog', {
        logs: JSON.stringify(logs),
    });
}

export function submitCount() {
    return client.postW('/pl/count');
}

/**
 * tell netease I've started listening a song;
 * it's not necessary, for now ...
 * @param {number} id
 * @param {number} userId
 */
export function submitSongStartPlay(id, userId) {
    let json = {
        id,
        type: 'song',
        content: `id=${userId}`
    };
    return sumbitFeedback([{ action: 'startplay', json }]);
}

/**
 * tell netease I've finished listening a song
 * @param {number} id
 * @param {number} time song duration, in seconds
 * @param {{name: string; id: string}} source
 * @param {number} userId
 */
export function submitSongPlayed(id, time, source, userId) {
    let json = {
        type: 'song',
        wifi: 0,
        download: 0,
        id,
        time: Math.round(time),
        end: 'ui',
        content: `id=${userId}`
    };
    if (source && source.id && source.name) {
        json.source = source.name;
        json.sourceId = `${source.id}`;
    }
    return sumbitFeedback([{ action: 'play', json }]);
}

export function getVipInfo() {
    return client.postW('/music-vip-membership/front/vip/info');
}

/**
 * get size of cached data in bytes
 * @param {Types.CacheType} type cache type
 * @returns {Promise<{ok: boolean; size: number; msg?: string}>}
 */
export async function getDataSize(type) {
    const cachePath = CachePath[type];
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
 * @param {Types.CacheType} type cache type
 * @returns {Promise<{ok: boolean; msg?: string}>}
 */
export async function clearCache(type) {
    try {
        await clearDirectory(CachePath[type]);
    } catch (e) {
        return {
            ok: false,
            msg: e.stack
        };
    }
    return { ok: true };
}

/**
 * @returns {Promise<string>}
 */
export function getVersionName() {
    let version = app.getVersion();
    if (process.env.NODE_ENV === 'development') {
        return new Promise((resolve) => {
            require('child_process').exec('git describe --long', (err, stdout) => {
                resolve(err ? `${version}-dev` : stdout.trim());
            });
        });
    }
    return Promise.resolve(version);
}

/**
 * @returns {Promise<Settings.Value>}
 */
export function getCurrentSettings() {
    return Settings.get();
}

/**
 * write and save settings to file
 * @param {Settings.Value} target settings to write
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
    return client.postW('/point/dailyTask', { type });
}

/**
 * eapi 签到
 * @param {0|1} type `0`:移动端, `1`:桌面/网页端
 * @param {number} adid
 * @returns {Promise<Types.DailyTaskRes>}
 */
export function postDailyTaskE(type, adid = 0) {
    return client.postE('/point/dailyTask', { type, adid });
}

/**
 * 获取签到状态
 * @returns {Promise<Types.GetDailyTaskRes>}
 */
export function getDailyTask() {
    return client.postE('/point/getDailyTask');
}

/**
 * add or remove tracks in playlist
 * @param {'add'|'del'} op opreation
 * @param {number} pid playlist id
 * @param {number[]} tracks track id
 */
export function manipulatePlaylistTracks(op, pid, tracks) {
    return client.postW('/playlist/manipulate/tracks', {
        op,
        pid,
        // tracks,
        trackIds: JSON.stringify(tracks),
    });
}

/**
 * add tracks to playlist
 * @param {number} pid playlist id
 * @param {number[]} tracks track to add
 * @returns {Promise<Types.CollectTrackRes>}
 */
export function collectTrack(pid, ...tracks) {
    return manipulatePlaylistTracks('add', pid, tracks);
}

/**
 * remove tracks from playlist
 * @param {number} pid playlist id
 * @param {number[]} tracks track to remove
 * @returns {Promise<Types.UncollectTrackRes>}
 */
export function uncollectTrack(pid, ...tracks) {
    return manipulatePlaylistTracks('del', pid, tracks);
}

const SearchTypes = {
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
 * @param {string} s keyword
 * @param {keyof SearchTypes} type
 * @returns {Promise<Types.SearchSuggestERes>}
 */
export function getSearchSuggest(s, type = 'song') {
    return client.postE('/search/suggest/keyword', {
        lastTime: 0,
        s,
        limit: 10,
        type: SearchTypes[type]
    });
}

/**
 * preform search
 * @param {string} s keyword
 * @param {keyof SearchTypes} type
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Types.SearchRes>}
 */
export function search(s, type, limit = 20, offset = 0) {
    return client.postE('/v1/search/get', {
        sub: false,
        q_scene: 'suggest',
        s,
        offset,
        limit,
        queryCorrect: false,
        strategy: 5,
        type: SearchTypes[type]
    });
}

export function subscribePlaylist(id) {
    return client.postW('/playlist/subscribe', { id });
}

export function unsubscribePlaylist(id) {
    return client.postW('/playlist/unsubscribe', { id });
}

/**
 * @param {number} limit defalut to `25`
 * @param {number} offset default to `0`
 * @returns {Promise<Types.SubscribedArtistRes>}
 */
export function getSubscribedArtists(limit = 25, offset = 0) {
    return client.postW('/artist/sublist', {
        limit,
        offset
    });
}

/**
 * @param {number} limit defalut to `25`
 * @param {number} offset default to `0`
 * @returns {Promise<Types.FavoriteVideoRes>}
 */
export function getFavoriteVideos(limit = 25, offset = 0) {
    return client.postW('/cloudvideo/allvideo/sublist', {
        limit,
        offset
    });
}

/**
 * @param {number} limit defalut to `25`
 * @param {number} offset default to `0`
 * @returns {Promise<Types.SubscribedAlbumRes>}
 */
export function getSubscribedAlumbs(limit = 25, offset = 0) {
    return client.postE('/album/sublist', {
        limit,
        offset
    });
}

/**
 * album detail, weapi
 * @param {number|string} id
 * @returns {Promise<Types.AlbumDetailWRes>}
 */
export function getAlbumDetailW(id) {
    return client.postW(`/v1/album/${id}`, {
        total: true,
        offset: 0,
        id: id,
        limit: 1000,
        ext: true,
        private_cloud: true
    });
}

/**
 * album detail, linux forward api
 * @param {number|string} id
 * @returns {Promise<Types.AlbumDetailWRes>}
 */
export function getAlbumDetailL(id) {
    return client.postL(`/v1/album/${id}`, { id }, 'GET');
}

/**
 * album detail, eapi.
 * @param {number|string} id
 * @returns {Promise<Types.AlbumDetailRes>}
 */
export function getAlbumDetailE(id) {
    return client.postE('/album/v3/detail', { id }, true);
}

/**
 * @param {number|string} id
 * @returns {Promise<Types.AlbumDynamicDetailRes>}
 */
export function getAlbumDynamicDetail(id) {
    return client.postE('/album/detail/dynamic', { id });
}

/**
 * @param {number|string} id
 * @returns {Promise<Types.AlbumPrivilegeRes>}
 */
export function getAlbumPrivilege(id) {
    return client.postE('/album/privilege', { id });
}

// utils for api `getRelatedPlaylists`
const RelatedPlaylists = {
    regexp: /<div class="cver u-cover u-cover-3">[\s\S]*?title="(.+)"\ndata-res-id="(\d+)"[\s\S]*?<img src="(.+)"[\s\S]*?<a class="nm nm f-thide s-fc3" href="(.+)" title="(.+)">/g,
    /**
     * @param {string} u
     */
    trimSrc(u) {
        const url = new URL(u);
        url.search = '';
        return url.href;
    },
    /**
     * @param {string} u
     */
    trimId(u) {
        const i = u.indexOf('?');
        const s = new URLSearchParams(i > 0 ? u.slice(i) : u);
        return s.get('id');
    }
};

/**
 * get playlists related to given playlist
 * @param {number} id
 * @returns {Promise<Types.RelatedPlaylistsRes>}
 */
export async function getRelatedPlaylists(id) {
    try {
        const html = await client.get({
            url: `${BaseURL}/playlist?id=${id}`,
            headers: {
                'User-Agent': HttpClient.DesktopUserAgent
            }
        });
        const data = [];
        let match;
        while ((match = RelatedPlaylists.regexp.exec(html)) !== null) {
            data.push({
                name: decodeHTML(match[1]),
                id: match[2],
                picUrl: RelatedPlaylists.trimSrc(match[3]),
                creator: {
                    id: RelatedPlaylists.trimId(match[4]),
                    name: decodeHTML(match[5])
                }
            });
        }
        return { code: 200, data };
    } catch (e) {
        throw { code: 500, error: e.stack };
    }
}

const RecommendStatistics = {
    regexp: /你播放了[\s\S]*?(\d+)<\/strong>首音乐[\s\S]*?你喜欢了[\s\S]*?(\d+)<\/strong>首音乐[\s\S]*?你收藏了[\s\S]*?(\d+)<\/strong>位歌手/
};

/**
 * @returns {Promise<Types.RecommendStatisticsRes>}
 */
export async function getRecommendStatistics() {
    try {
        const html = await client.get({
            url: `${BaseURL}/discover/recommend/taste`,
            headers: {
                'User-Agent': HttpClient.DesktopUserAgent
            }
        });
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
        throw { code: 500, error: e.stack };
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
    try {
        const html = await client.get({
            url: `${BaseURL}/album?id=${id}`,
            headers: {
                'User-Agent': HttpClient.DesktopUserAgent
            }
        });
        const data = [];
        let match;
        while ((match = RelatedAlbums.regexp.exec(html)) !== null) {
            data.push({
                id: RelatedPlaylists.trimId(match[1]),
                name: decodeHTML(match[2]),
                picUrl: RelatedPlaylists.trimSrc(match[3]),
                publishDate: match[4]
            });
        }
        return { code: 200, data };
    } catch (e) {
        throw { code: 500, error: e.stack };
    }
}

/**
 * @param {string} id
 * @returns {Promise<Types.SubscribeAlbumRes>}
 */
export function subscribeAlbum(id) {
    return client.postE('/album/sub', { id });
}

/**
 * @param {string} id
 * @returns {Promise<Types.UnsubscribeAlbumRes>}
 */
export function unsubscribeAlbum(id) {
    return client.postE('/album/unsub', { id });
}

/**
 * 推荐 MV
 * @returns {Promise<Types.RecommendMVRes>}
 */
export function getRecommendMVs() {
    return client.postW('/personalized/mv');
}

/**
 * 推荐歌单，包含前两个固定的编辑推荐，不登录也能用
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Types.PersonalizedPlaylistRes>}
 */
export function getPersonalizedPlaylists(limit = 10, offset = 0) {
    return client.postE('/personalized/playlist', {
        limit,
        offset,
        total: true,
        n: 1000
    });
}

/**
 * artist detail, eapi.
 * @param {number|string} id
 * @param {number} top
 * @returns {Promise<Types.ArtistDetailERes>}
 */
export function getArtistDetailE(id, top = 50) {
    return client.postE('/artist/v3/detail', { id, top }, true);
}

/**
 * @param {number|string} id
 * @returns {Promise<Types.ArtistDetailWRes>}
 */
export function getArtistDetailW(id) {
    return client.postW(`/artist/${id}`);
}

/**
 * @param {number|string} id
 * @returns {Promise<Types.ArtistDynamicDetailRes>}
 */
export function getArtistDynamicDetail(id) {
    return client.postE('/artist/detail/dynamic', { id });
}

/**
 * @param {number|string} artistId
 * @returns {Promise<Types.ApiRes>}
 */
export function followArtist(artistId) {
    return client.postW('/artist/sub', {
        artistId,
        artistIds: `[${artistId}]`
    });
}

/**
 * @param {number|string} artistId
 * @returns {Promise<Types.ApiRes>}
 */
export function unfollowArtist(artistId) {
    return client.postW('/artist/unsub', {
        artistId,
        artistIds: `[${artistId}]`
    });
}

/**
 * @param {number} id
 * @param {number} offset
 * @param {number} limit
 * @returns {Promise<Types.ArtistAlbumsRes>}
 */
export function getArtistAlbums(id, offset = 0, limit = 30) {
    return client.postW(`/artist/albums/${id}`, {
        offset,
        limit,
        total: true
    });
}

/**
 * @param {number} artistId
 * @param {number} offset
 * @param {number} limit
 * @returns {Promise<Types.ArtistMVsRes>}
 */
export function getArtistMVs(artistId, offset = 0, limit = 30) {
    return client.postW('/artist/mvs', {
        artistId,
        offset,
        limit,
        total: true
    });
}

/**
 * @param {number} id
 * @returns {Promise<Types.ArtistIntroRes>}
 */
export function getArtistIntro(id) {
    return client.postW('/artist/introduction', { id });
}

/**
 * @param {number} id
 * @returns {Promise<Types.MVDetailRes>}
 */
export function getMVDetail(id) {
    return client.postW('/mv/detail', { id });
}

/**
 * @param {string} mvId
 * @returns {Promise<Types.SubscribeMVRes>}
 */
export function subscribeMV(mvId) {
    return client.postW('/mv/sub', {
        mvId,
        mvIds: `[${mvId}]`
    });
}

/**
 * @param {string} mvId
 * @returns {Promise<Types.UnsubscribeMVRes>}
 */
export function unsubscribeMV(mvId) {
    return client.postW('/mv/unsub', {
        mvId,
        mvIds: `[${mvId}]`
    });
}

/**
 * @param {number} id
 * @returns {Promise<Types.VideoDetailRes>}
 */
export function getVideoDetail(id) {
    return client.postW('/cloudvideo/v1/video/detail', { id });
}

/**
 * @param {string} id
 * @returns {Promise<Types.SubscribeVideoRes>}
 */
export function subscribeVideo(id) {
    return client.postW('/cloudvideo/video/sub', { id });
}

/**
 * @param {string} id
 * @returns {Promise<Types.UnsubscribeVideoRes>}
 */
export function unsubscribeVideo(id) {
    return client.postW('/cloudvideo/video/unsub', { id });
}

/**
 * @param {string} id
 * @returns {Promise<Types.VideoStatisticRes>}
 */
export function getVideoStatistic(id) {
    return client.postW('/cloudvideo/v1/video/statistic', { id });
}

/**
 * @param {number} id
 * @param {number} resolution
 * @returns {Promise<Types.VideoURLRes>}
 */
export function getVideoURL(id, resolution = 1080) {
    return client.postW('/cloudvideo/playurl', {
        ids: `["${id}"]`,
        resolution
    });
}

/**
 * 评论/赞/分享总数以及是否赞过
 * @param {string} threadid
 * @returns {Promise<Types.CommentThreadInfoERes>}
 */
export function getCommentThreadInfoE(threadid) {
    return client.postE('/comment/commentthread/info', {
        threadid,
        composeliked: 'true'
    });
}

/**
 * @param {string} threadId
 * @returns {Promise<Types.ApiRes>}
 */
export function likeResourceE(threadId) {
    return client.postE('/resource/like', { threadId });
}

/**
 * @param {string} threadId
 * @returns {Promise<Types.ApiRes>}
 */
export function unlikeResourceE(threadId) {
    return client.postE('/resource/unlike', { threadId });
}

/**
 * @param {string} threadId
 * @returns {Promise<Types.ApiRes>}
 */
export function likeResource(threadId) {
    return client.postW('/resource/like', { threadId });
}

/**
 * @param {string} threadId
 * @returns {Promise<Types.ApiRes>}
 */
export function unlikeResource(threadId) {
    return client.postW('/resource/unlike', { threadId });
}

/**
 * @returns {Promise<Types.RadioRes>}
 */
export function getRadio() {
    return client.postW('/v1/radio/get');
}

/**
 * @param {number} songId
 * @param {number} time
 * @returns {Promise<Types.DislikeRadioSongRes>}
 */
export function dislikeRadioSong(songId, time) {
    const query = qs.stringify({ alg: 'RT', songId, time });
    return client.postW(`/radio/trash/add?${query}`, { songId });
}

/**
 * @returns {Promise<Types.RadioRes>}
 */
export function getRadioE() {
    return client.postE('/v1/radio/get');
}

/**
 * @param {number} songId
 * @param {number} time time in ms
 * @returns {Promise<Types.SkipRadioERes>}
 */
export function skipRadioE(songId, time) {
    return client.postE('/v1/radio/skip', {
        songId,
        time,
        alg: 'itembased'
    });
}

/**
 * @param {number} trackId
 * @param {number} time time in ms
 * @param {boolean} like should like or not
 * @returns {Promise<Types.LikeRadioERes>}
 */
export function likeRadioE(trackId, time, like = true) {
    return client.postE('/v1/radio/like', {
        trackId,
        time,
        alg: 'itembased',
        like
    });
}

/**
 * @param {number} songId
 * @param {number} time time in ms
 * @returns {Promise<Types.AddRadioTrashERes>}
 */
export function addRadioTrashE(songId, time) {
    return client.postE('/v1/radio/trash/add', {
        songId,
        time,
        alg: 'alg_fm_rt_bysong'
    });
}

/**
 * @param {number} limit
 * @param {number} addTime
 * @returns {Promise<Types.RadioTrashERes>}
 */
export function getRadioTrashE(limit, addTime) {
    return client.postE('/v2/radio/trash/get', { limit, addTime });
}

/**
 * @param {number} songId
 * @returns {Promise<Types.ApiRes>}
 */
export function removeRadioTrashE(songId) {
    return client.postE('/radio/trash/del', { songId });
}

/**
 * @param {number} trackId
 * @param {boolean} like
 * @returns {Promise<Types.LikeSongERes>}
 */
export function likeSongE(trackId, like = true) {
    return client.postE('/song/like', { trackId, like, userid: 0 });
}

/**
 * 下载歌曲
 * @param {Models.Track} metadata
 * @param {Types.MusicQuality} quality
 * @returns {Promise<Types.DownloadSongRes>}
 */
export function downloadSong(metadata, quality) {
    return downloader.download(metadata, quality);
}

/**
 * 检查是否已经下载
 * @param {Models.Track} metadata 
 * @returns {boolean}
 */
export function checkDownloaded(metadata) {
    return downloader.check(metadata);
}

/**
 * 首页推荐->最新音乐
 * @returns {Promise<Types.NewAlbumsRes>}
 */
export function getNewAlbums() {
    return client.postE('/personalized/newalbum');
}

/**
 * 首页->Banner 横幅
 * @param {"pc" | "web" | "android" | "iphone"} clientType
 * @returns {Promise<Types.BannerRes>}
 */
export function getBanners(clientType = 'pc') {
    return client.postE('/banner/get/v3', { clientType });
}

/**
 * 订阅电台
 * @param {number} id
 * @returns {Promise<Types.ApiRes>}
 */
export function subscribeDjRadio(id) {
    return client.postE('/djradio/sub', { id });
}

/**
 * 取消订阅电台
 * @param {number} id
 * @returns {Promise<Types.ApiRes>}
 */
export function unsubscribeDjRadio(id) {
    return client.postE('/djradio/unsub', { id });
}

/**
 * 订阅的电台列表
 * @param {number} limit
 * @param {number} time
 * @param {boolean} needFee
 * @returns {Promise<Types.SubscribedDjRes>}
 */
export function getSubscribedDjRadio(limit = 100, time = 0, needFee = false) {
    return client.postE('/djradio/subed/v1', { limit, time, needFee });
}

/**
 * 电台详情
 * @param {number} id
 * @returns {Promise<Types.DjDetailRes>}
 */
export function getDjRadioDetail(id) {
    return client.postE('/djradio/v2/get', { id });
}

/**
 * 电台节目列表
 * @param {number} radioId
 * @param {number} limit max 500
 * @param {number} offset
 * @param {boolean} asc
 * @param {boolean} filterlikeplay
 * @returns {Promise<Types.DjProgramRes>}
 */
export function getDjRadioProgram(radioId, limit = 100, offset = 0, asc = false, filterlikeplay = true) {
    return client.postE('/v1/dj/program/byradio', { radioId, limit, offset, asc, filterlikeplay });
}

/**
 * 电台节目详情
 * @param {number} id
 * @returns {Promise<Types.DjProgramDetailRes>}
 */
export function getDjRadioProgramDetail(id) {
    return client.postE('/dj/program/detail', { id });
}

/**
 * 批量查询电台节目可用音质与文件大小
 * @param {number|number[]} idOrIds
 * @returns {Promise<Types.DjProgramMusicsRes>}
 */
export function getDjRadioProgramMusics(idOrIds) {
    const ids = `[${idOrIds}]`;
    return client.postE('/dj/program/song/musics', { ids });
}

/**
 * 用户创建的电台
 * @param {number} userId
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Types.DjCreatedByRes>}
 */
export function getDjRadioCreatedBy(userId, limit = 1000, offset = 0) {
    return client.postE('/djradio/get/byuser', { userId, limit, offset });
}

/**
 * 用户信息
 * @param {number} id
 * @returns {Promise<Types.UserInfoRes>}
 */
export function getUserInfo(id) {
    return client.postE(`/v1/user/detail/${id}`, { all: true });
}

/**
 * 关注用户
 * @param {number} id
 * @returns {Promise<Types.FollowUserRes>}
 */
export function followUser(id) {
    return client.postE(`/user/follow/${id}`);
}

/**
 * 取消关注用户
 * @param {number} id
 * @returns {Promise<Types.ApiRes>}
 */
export function unfollowUser(id) {
    return client.postE(`/user/delfollow/${id}`);
}

/**
 * 用户的粉丝
 * @param {number} userId
 * @param {number} time
 * @param {number} limit
 * @returns {Promise<Types.UserFollowersRes>}
 */
export function getUserFollowers(userId, time = -1, limit = 30) {
    return client.postE(`/user/getfolloweds/${userId}`, { userId, time, limit });
}

/**
 * 用户关注的人
 * @param {number} userId
 * @param {number} offset
 * @param {number} limit
 * @param {boolean} order
 * @returns {Promise<Types.UserFollowsRes>}
 */
export function getUserFollows(userId, offset = 0, limit = 30, order = true) {
    return client.postE(`/user/getfollows/${userId}`, { offset, limit, order });
}

/**
 * 用户动态
 * @param {number} id
 * @param {number} time
 * @param {number} limit
 * @param {boolean} getcounts
 * @returns {Promise<Types.UserEventsRes>}
 */
export function getUserEvents(id, time = -1, limit = 20, getcounts = true) {
    return client.postE(`/event/get/${id}`, { time, limit, getcounts });
}

/**
 * 用户的置顶动态
 * @param {number} userId
 * @returns {Promise<Types.UserTopEventsRes>}
 */
export function getUserTopEvents(userId) {
    return client.postE('/event/top/get', { userId });
}

/**
 * 用户的大学信息
 * @param {number} userId
 */
export function getUserCollege(userId) {
    return client.postE('/college/usercollege/get', { userId });
}

/**
 * 全部喜欢的歌曲 ID
 * @returns {Promise<Types.LikedSongIdsRes>}
 */
export function getLikedSongIds() {
    return client.postE('/song/like/get');
}

/**
 * 云盘歌曲列表
 * @returns {Promise<Types.PrivateCloudListRes>}
 */
export function getPrivateCloudList(limit = 500, offset = 0) {
    return client.postE('/v1/cloud/get', { limit, offset });
}

/**
 * 删除云盘歌曲
 * @param {number[]} songIds
 */
export function removePrivateCloudItem(songIds) {
    return client.postE('/cloud/del', { songIds });
}

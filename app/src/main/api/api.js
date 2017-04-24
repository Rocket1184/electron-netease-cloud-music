import crypto from 'crypto';
import { Lrc } from 'lrc-kit';

import Client from './httpclient';

const BaseURL = 'http://music.163.com';

const client = new Client();

function updateCookie(cookie) {
    client.updateCookie(cookie);
    return client.getCookie('');
}

function getCookie(key = '') {
    return client.getCookie(key);
}

async function login(acc, pwd) {
    const password = crypto.createHash('md5').update(pwd).digest('hex');
    if (/^1\d{10}$/.test(acc)) {
        return await client.post({
            url: `${BaseURL}/weapi/login/cellphone`,
            data: {
                phone: acc,
                password,
                rememberLogin: true
            }
        });
    }
    else {
        return await client.post({
            url: `${BaseURL}/weapi/login`,
            data: {
                username: acc,
                password,
                rememberLogin: true
            }
        });
    }
}

async function getUserPlaylist(uid) {
    return await client.post({
        url: `${BaseURL}/weapi/user/playlist`,
        data: {
            uid,
            offset: 0,
            limit: 1,
            csrf_token: ''
        }
    });
}

async function getMusicRecord(uid) {
    return await client.post({
        url: `${BaseURL}/weapi/v1/play/record`,
        data: {
            uid,
            type: 0,
            csrf_token: ''
        }
    });
}

async function getDailySuggestions() {
    return await client.post({
        url: `${BaseURL}/weapi/v1/discovery/recommend/songs`,
        data: {
            offset: 0,
            total: true,
            limit: 20,
            csrf_token: ''
        }
    });
}

async function getListDetail(id) {
    return client.post({
        url: `${BaseURL}/weapi/v3/playlist/detail`,
        data: {
            id,
            offset: 0,
            total: true,
            limit: 1000,
            n: 1000,
            csrf_token: ''
        }
    });
}

async function getMusicUrl(idOrIds, br = 320000) {
    let ids;
    if (Array.isArray(idOrIds)) ids = idOrIds;
    else ids = [idOrIds];
    return await client.post({
        url: `${BaseURL}/weapi/song/enhance/player/url`,
        data: {
            ids,
            br,
            csrf_token: ''
        }
    });
}

async function getMusicComments(rid, limit = 20, offset = 0) {
    return await client.post({
        url: `${BaseURL}/weapi/v1/resource/comments/R_SO_4_${rid}`,
        data: {
            rid,
            offset,
            limit,
            csrf_token: ''
        }
    });
}

function byTimestamp(a, b) {
    return a.timestamp - b.timestamp;
}

async function getMusicLyric(id) {
    const tmp = await client.post({
        url: `${BaseURL}/weapi/song/lyric`,
        data: {
            id,
            os: 'pc',
            lv: -1,
            kv: -1,
            tv: -1,
            csrf_token: ''
        }
    });
    let result = {};
    if (tmp.lrc && tmp.lrc.version) {
        result.lrc = Lrc.parse(tmp.lrc.lyric);
        result.lrc.lyrics = result.lrc.lyrics.sort(byTimestamp);
        result.lyricUser = tmp.lyricUser;
    }
    if (tmp.tlyric && tmp.tlyric.version) {
        result.transUser = tmp.transUser;
        let tlrc = Lrc.parse(tmp.tlyric.lyric);
        tlrc.lyrics = tlrc.lyrics.sort(byTimestamp);
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

async function submitWebLog(action, json) {
    return await client.post({
        url: `${BaseURL}/weapi/log/web`,
        data: {
            action,
            json: JSON.stringify(json),
            csrf_token: ''
        }
    });
}

async function submitListened(id, time) {
    return await submitWebLog('play', {
        id,
        type: 'song',
        wifi: 0,
        download: 0,
        time: Math.round(time),
        end: 'playend',
    });
}

export default {
    getCookie,
    updateCookie,
    login,
    getUserPlaylist,
    getMusicRecord,
    getDailySuggestions,
    getListDetail,
    getMusicUrl,
    getMusicComments,
    getMusicLyric,
    submitListened
};

import fs from 'fs';
import url from 'url';
import path from 'path';
import crypto from 'crypto';
import { Lrc } from 'lrc-kit';
import qs from 'child_process';
import { app } from 'electron';
import { http, https } from 'follow-redirects';

import Client from './httpclient';
import * as Settings from '../settings';

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
    const postBody = {
        password,
        rememberLogin: true,
        // FIXME: do not hardcode this......
        clientToken: '1_skSxFOj/XAm7bjxjQW5FD4x73jFAbgiM_G37CFfnJVaG1oIU/7exF6ro65ioeuAbf_bRRvlPMnoredCK5p2Upo7Q=='
    };
    if (/^1\d{10}$/.test(acc)) {
        return await client.post({
            url: `${BaseURL}/weapi/login/cellphone`,
            data: { phone: acc, ...postBody }
        });
    } else {
        return await client.post({
            url: `${BaseURL}/weapi/login`,
            data: { username: acc, ...postBody }
        });
    }
}

async function refreshLogin() {
    let csrf = client.getCookie('__csrf');
    return await client.post({
        url: `${BaseURL}/weapi/login/token/refresh?csrf_token=${csrf}`,
        data: {
            csrf_token: csrf
        }
    });
}

async function getUserPlaylist(uid) {
    return await client.post({
        url: `${BaseURL}/weapi/user/playlist`,
        data: {
            uid,
            offset: 0,
            limit: 1000,
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
    return await client.post({
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

const QualityMap = {
    h: 320000,
    m: 160000,
    l: 96000
};

async function getMusicUrl(idOrIds, quality = 'h') {
    if (!QualityMap[quality]) throw new Error(`Quality type '${quality}' is not in [h,m,l]`);
    let ids;
    if (Array.isArray(idOrIds)) ids = idOrIds;
    else ids = [idOrIds];
    return await client.post({
        url: `${BaseURL}/weapi/song/enhance/player/url`,
        data: {
            ids,
            br: QualityMap[quality],
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

function checkUrlStatus(u = 'http://m10.music.126.net') {
    u = String(u);
    if (!~u.indexOf('http')) return new Promise(resolve => resolve(-1));
    const opt = url.parse(u);
    let request;
    switch (opt.protocol) {
        case 'https:':
            request = https;
            break;
        case 'http:':
            request = http;
    }
    return new Promise(resolve => {
        request.request({
            host: opt.host,
            path: opt.path + (opt.search || '')
        }, resp => {
            resolve(resp.statusCode);
        }).end();
    });
}

function getDirSize(dirPath) {
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

const dataDirMap = {
    app: '',
    cache: 'Cache'
};
const appData = app.getPath('appData');
const appName = process.env.NODE_ENV === 'development'
    ? 'Electron'
    : require('../../../package.json').name;

function getDataSize(name = 'app') {
    const cachePath = path.join(appData, appName, dataDirMap[name]);
    let size;
    try {
        size = getDirSize(cachePath);
    } catch (err) {
        size = 0;
    }
    return size;
}

function clearAppData(name = 'cache') {
    const delPath = path.join(appData, appName, dataDirMap[name]);
    try {
        qs.execSync(`rm -rf ${delPath}`);
    } catch (err) {
        return err;
    }
    return false;
}

function getVersionName() {
    let version = require('../../../package.json').version;
    if (process.env.NODE_ENV === 'development') {
        version += '-hot';
        let rev = '';
        try {
            rev = qs.execSync('git rev-parse --short HEAD').toString().trim();
            version += `.${rev}+`;
        } catch (err) { }
    } else {
        let hash;
        try {
            const hashFilePath = path.join(app.getPath('exe'), '../ncm_hash');
            hash = fs.readFileSync(hashFilePath).toString().trim();
            version += `-${hash}`;
        } catch (err) { }
    }
    return version;
}

function getCurrentSettings() {
    return Settings.getCurrent();
}

function writeSettings(target) {
    Settings.set(target);
}

async function postDailyTask(type) {
    return await client.post({
        url: `${BaseURL}/weapi/point/dailyTask?type=${type}`,
        data: {
            csrf_token: ''
        }
    });
}

export default {
    getCookie,
    updateCookie,
    login,
    refreshLogin,
    getUserPlaylist,
    getMusicRecord,
    getDailySuggestions,
    getListDetail,
    getMusicUrl,
    getMusicComments,
    getMusicLyric,
    submitListened,
    checkUrlStatus,
    getDataSize,
    clearAppData,
    getVersionName,
    getCurrentSettings,
    writeSettings,
    postDailyTask
};

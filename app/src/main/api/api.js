import crypto from 'crypto';

import Client from './httpclient';

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
            url: 'http://music.163.com/weapi/login/cellphone',
            data: {
                phone: acc,
                password,
                rememberLogin: true
            }
        });
    }
    else {
        return await client.post({
            url: 'http://music.163.com/weapi/login',
            data: {
                username: acc,
                password,
                rememberLogin: true
            }
        });
    }
}

async function getUserInfo(uid) {
    return await client.post({
        url: 'http://music.163.com/weapi/user/playlist',
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
        url: 'http://music.163.com/weapi/v1/play/record?csrf_token=',
        data: {
            uid,
            type: 0,
            csrf_token: ''
        }
    });
}

async function getDailySuggestions() {
    return await client.post({
        url: 'http://music.163.com/weapi/v1/discovery/recommend/songs',
        data: {
            offset: 0,
            total: true,
            limit: 20,
            csrf_token: ''
        }
    });
}

export default {
    getCookie,
    updateCookie,
    login,
    getUserInfo,
    getMusicRecord,
    getDailySuggestions
};

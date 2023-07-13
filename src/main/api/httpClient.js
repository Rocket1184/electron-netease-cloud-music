import { URL } from 'url';
import qs from 'querystring';

import debug from 'debug';
import fetch from 'electron-fetch';
import { CookieJar, CookieAccessInfo } from 'cookiejar';

import { encodeWeb, encodeLinux, encodeEApi, decodeEApi, getCacheKey } from './codec';

const d = debug('HTTP');

export default class HttpClient {

    static DesktopUserAgent = 'Mozilla/5.0 (Linux) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';
    static MobileUserAgent = 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36';

    constructor() {
        this.clientHeaders = {
            Accept: '*/*',
            'Accept-Language': 'zh',
            'Accept-Encoding': 'gzip',
            Referer: 'https://music.163.com/',
            'User-Agent': HttpClient.MobileUserAgent
        };
        this.initCookieJar();
    }

    initCookieJar() {
        this.cookieJar = new CookieJar();
    }

    /**
     * clear all cookies, and set cookie as given arguments
     * @param {Record<string, string>} [arg] 
     */
    updateCookie(arg = {}) {
        this.initCookieJar();
        const ignoredMobileCookie = ['os', 'osver', 'appver', 'mobilename'];
        const cookies = Object.entries(arg)
            .filter(([k]) => !ignoredMobileCookie.includes(k))
            .map(([k, v]) => `${k}=${v}`);
        this.cookieJar.setCookies(cookies);
    }

    /**
     * @param {string} [key]
     */
    getCookie(key) {
        const cookies = this.cookieJar.getCookies(CookieAccessInfo.All);
        if (!key) {
            /**
             * @type {Record<string, string>}
             */
            let result = {};
            cookies.forEach(c => result[c.name] = c.value);
            return result;
        }
        return cookies.find(c => c.name === key)?.value ?? '';
    }

    getCookieString() {
        const cookies = this.cookieJar.getCookies(CookieAccessInfo.All);
        return cookies.map(c => c.toValueString()).join('; ');
    }

    /**
     * merge provided header key-value maps with pre-defined headers
     * @param  {...any} headers headers to append
     */
    mergeHeaders(...headers) {
        let hd = Object.assign({}, this.clientHeaders, ...headers);
        if (hd.Cookie) {
            hd.Cookie += ('; ' + this.getCookieString());
        } else {
            hd.Cookie = this.getCookieString();
        }
        return hd;
    }

    /**
     * update cookiejar with 'set-cookie' headers
     * @param {import('electron-fetch').Response} res electron-fetch's `Response` object
     */
    handleResponse(res) {
        /** @type {Record<string, string[]>} */
        const headers = res.headers.raw();
        for (const [key, value] of Object.entries(headers)) {
            if (key === 'set-cookie') {
                this.cookieJar.setCookies(value);
                break;
            }
        }
    }

    /**
     * log response with url, method, status and data (only when status !== 200)
     * @param {string} url
     * @param {string} method 
     * @param {number} status
     * @param {any} data
     */
    logResponse(url, method, status, data) {
        d('%o %o %s', status, method, url);
        if (status !== 200) {
            d('%o', data);
        }
    }

    async get(config) {
        let url = typeof config === 'string' ? config : config.url;
        /** @type {import('electron-fetch').RequestInit} */
        let init = {
            method: 'GET'
        };

        init.headers = this.mergeHeaders(config.headers);

        const res = await fetch(url, init);
        this.handleResponse(res);
        let data;
        if (res.headers.get('content-type').includes('application/json')) {
            data = await res.json();
        } else {
            data = await res.text();
        }
        this.logResponse(url, 'GET', res.status, data);
        return data;
    }

    /**
     * wrapper of electron-fetch function
     * @param {string} url
     * @param {import('electron-fetch').RequestInit} init
     */
    async post(url, init) {
        init.headers = this.mergeHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(init.body)
        }, init.headers);

        const res = await fetch(url, init);
        this.handleResponse(res);
        const data = await res.json();
        this.logResponse(url, 'POST', res.status, data);
        return data;
    }

    /**
     * weapi request
     * @param {string} url
     * @param {object} data
     */
    postW(url, data = {}) {
        url = `https://music.163.com/weapi${url}`;
        /** @type {import('electron-fetch').RequestInit} */
        let init = {
            method: 'POST',
            body: ''
        };
        let body = data;
        const __csrf = this.getCookie('__csrf');
        if (__csrf) {
            url += `?csrf_token=${__csrf}`;
            body.csrf_token = __csrf;
        }
        init.body = qs.stringify(encodeWeb(body));
        return this.post(url, init);
    }

    /**
     * linux/forward api request
     * only use it when you **HAVE TO**
     * @param {string} url
     * @param {object} data
     */
    postL(url, data = {}, method = 'POST') {
        let body = {
            method,
            url: `http://music.163.com/api${url}`,
            params: data
        };
        /** @type {import('electron-fetch').RequestInit} */
        let init = {
            method: 'POST',
            headers: {
                Cookie: 'os=pc; osver=linux; appver=2.0.3.131777; channel=netease'
            },
            body: qs.stringify(encodeLinux(body))
        };
        return this.post('https://music.163.com/api/linux/forward', init);
    }

    /**
     * eapi request
     * @param {string} url
     * @param {object} data
     * @param {boolean} putCacheKey
     */
    async postE(url, data = {}, putCacheKey = false) {
        url = `https://music.163.com/eapi${url}`;
        let body = Object.assign({ e_r: 'true' }, data);
        if (putCacheKey) {
            body['cache_key'] = getCacheKey(body);
        }
        // default eapi cookies
        body.header = Object.assign({
            os: 'android',
            osver: '10.0.0',
            appver: '8.10.20',
            mobilename: 'linux'
        }, this.getCookie());
        /** @type {import('electron-fetch').RequestInit} */
        let init = {
            method: 'POST',
            headers: {},
            body: ''
        };
        // encrypt request payload
        init.body = qs.stringify(encodeEApi(new URL(url).pathname, body));
        init.headers = this.mergeHeaders({
            'Cookie': 'os=android; osver=10.0.0; appver=2.0.3.131777; mobilename=linux',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(init.body)
        });
        const res = await fetch(url, init);
        this.handleResponse(res);
        const buf = await res.buffer();
        const json = JSON.parse(decodeEApi(buf));
        this.logResponse(url, 'POST', res.status, json);
        return json;
    }
}

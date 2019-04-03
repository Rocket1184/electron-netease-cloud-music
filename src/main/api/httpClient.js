import { URL } from 'url';
import qs from 'querystring';
import { randomFillSync } from 'crypto';

import debug from 'debug';
import fetch from 'node-fetch';
import { CookieJar, CookieAccessInfo } from 'cookiejar';

import { encodeWeb, encodeLinux, encodeEApi, decodeEApi } from './codec';

const d = debug('HTTP');

class HttpClient {
    constructor() {
        this.clientHeaders = {
            Accept: '*/*',
            'Accept-Language': 'zh',
            'Accept-Encoding': 'gzip',
            Referer: 'https://music.163.com/',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0'
        };
        this.initCookieJar();
    }

    initCookieJar() {
        const now = Date.now();
        const nuid = randomFillSync(Buffer.alloc(16)).toString('hex');
        const wyyy = randomFillSync(Buffer.alloc(132)).toString('base64');
        this.cookieJar = new CookieJar();
        this.cookieJar.setCookies([
            `JSESSIONID-WYYY=${wyyy}:${now}`,
            `_iuqxldmzr=32`,
        ], '.music.163.com', '/');
        this.cookieJar.setCookies([
            `_ntes_nnid=${nuid},${now}`,
            `_ntes_nuid=${nuid}`
        ], '.163.com', '/');
    }

    /**
     * clear all cookies, and set cookie as given arguments
     * @param {string | string[] | Record<string, string>} [arg=''] 
     */
    updateCookie(arg = '') {
        this.initCookieJar();
        if (typeof arg === 'string' || Array.isArray(arg)) {
            this.cookieJar.setCookies(arg);
            return;
        }
        const cookies = Object.entries(arg).map(([k, v]) => `${k}=${v}`);
        this.cookieJar.setCookies(cookies);
    }

    /**
     * @param {string} [key]
     */
    getCookie(key) {
        const cookies = this.cookieJar.getCookies(CookieAccessInfo.All);
        if (!key) {
            let result = {};
            cookies.forEach(c => result[c.name] = c.value);
            return result;
        }
        const c = cookies.find(c => c.name === key) || {};
        return c.value;
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
     * @param {import('node-fetch').Response} res node-fetch's `Response` object
     */
    handleResponse(res) {
        const headers = res.headers.raw();
        for (const key in headers) {
            if (key.toLowerCase() === 'set-cookie') {
                this.cookieJar.setCookies(headers[key]);
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
        /** @type {RequestInit} */
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
     * wrapper of node-fetch function
     * @param {string} url
     * @param {RequestInit} init
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
     */
    postW(config) {
        let url = config.url;
        /** @type {RequestInit} */
        let init = {
            method: 'POST',
            body: config.data || {}
        };
        const __csrf = this.getCookie('__csrf');
        if (__csrf) {
            url += `?csrf_token=${__csrf}`;
            init.body.csrf_token = __csrf;
        }
        init.body = qs.stringify(encodeWeb(init.body));
        return this.post(url, init);
    }

    /**
     * linux/forward api request
     */
    postL(config) {
        const url = config.url;
        /** @type {RequestInit} */
        let init = {
            method: 'POST',
            body: config.data || {},
            headers: { Cookie: '' }
        };
        let cookie = {
            os: 'pc',
            osver: 'linux',
            appver: '2.0.3.131777',
            channel: 'netease'
        };
        // merge cookies
        Object.assign(cookie, config.headers && config.headers.Cookie);
        // put cookie string into RequestInit's header
        init.headers.Cookie = Object.entries(cookie).map(([k, v]) => `${k}=${v}`).join('; ');
        // encrypt request payload
        init.body = qs.stringify(encodeLinux(init.body));
        return this.post(url, init);
    }

    /**
     * eapi request
     */
    async postE(config) {
        const url = config.url;
        /** @type {RequestInit} */
        let init = {
            method: 'POST',
            body: {
                ...config.data,
                e_r: 'true',
                header: {}
            },
            headers: { Cookie: '' }
        };
        let cookie = {
            os: 'pc',
            osver: 'linux',
            appver: '2.0.3.131777',
            channel: 'netease'
        };
        // merge cookies
        Object.assign(cookie, config.headers && config.headers.Cookie);
        // put cookie k-v pair into body.header
        init.body.header = cookie;
        // extract url pathname for encrypt
        const u = new URL(url);
        // encrypt request payload
        init.body = qs.stringify(encodeEApi(u.pathname, init.body));
        init.headers = this.mergeHeaders({
            'Cookie': Object.entries(cookie).map(([k, v]) => `${k}=${v}`).join('; '),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(init.body)
        }, init.headers);
        const res = await fetch(url, init);
        this.handleResponse(res);
        const buf = await res.buffer();
        const data = JSON.parse(decodeEApi(buf));
        this.logResponse(url, 'POST', res.status, data);
        return data;
    }
}

export default HttpClient;

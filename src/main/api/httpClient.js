import qs from 'querystring';
import { randomFillSync } from 'crypto';

import debug from 'debug';
import fetch from 'node-fetch';
import { CookieJar, CookieAccessInfo } from 'cookiejar';

import { encodeWeb, encodeLinux } from './codec';

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
     * @param {string | string[] | Record<string, string>} arg 
     */
    updateCookie(arg = {}) {
        this.initCookieJar();
        if (typeof arg === 'string' || Array.isArray(arg)) {
            this.cookieJar.setCookies(arg);
            return;
        }
        const cookies = Object.entries(arg).map(([k, v]) => `${k}=${v}`);
        this.cookieJar.setCookies(cookies);
    }

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
        if (hd['Cookie']) {
            hd['Cookie'] += ('; ' + this.getCookieString());
        } else {
            hd['Cookie'] = this.getCookieString();
        }
        return hd;
    }

    /**
     * update cookiejar with 'set-cookie' headers, then parse JSON
     * @param {string} url request URL
     * @param {RequestInit} init node-fetch's `RequestInit` object
     * @param {import('node-fetch').Response} res node-fetch's `Response` object
     * @returns {Promise<any>}
     */
    handleResponse(url, init, res) {
        const headers = res.headers.raw();
        for (const key in headers) {
            if (key.toLowerCase() === 'set-cookie') {
                this.cookieJar.setCookies(headers[key]);
                break;
            }
        }
        d('%o %o %s', res.status, init.method, url);
        if (res.status !== 200) {
            d('%o', res.data);
        }
        return res.json();
    }

    post(config) {
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
        if (config.encrypt === 'linux') {
            init.body = qs.stringify(encodeLinux(init.body));
        } else {
            init.body = qs.stringify(encodeWeb(init.body));
        }

        init.headers = this.mergeHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(init.body)
        }, config.headers);

        return new Promise((resolve, reject) => {
            fetch(url, init)
                .then(res => this.handleResponse(url, init, res))
                .then(resolve)
                .catch(reject);
        });
    }

    get(config) {
        let url = typeof config === 'string' ? config : config.url;
        /** @type {RequestInit} */
        let init = {
            method: 'GET'
        };

        init.headers = this.mergeHeaders(config.headers);

        return new Promise((resolve, reject) => {
            fetch(url, init)
                .then(res => this.handleResponse(url, init, res))
                .then(resolve)
                .catch(reject);
        });
    }
}

export default HttpClient;

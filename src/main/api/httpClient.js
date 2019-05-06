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
            /**
             * @type {Record<string, string>}
             */
            let result = {};
            cookies.forEach(c => result[c.name] = c.value);
            return result;
        }
        const c = cookies.find(c => c.name === key) || { value: '' };
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
        /** @type {import('node-fetch').RequestInit} */
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
     * @param {import('node-fetch').RequestInit} init
     */
    async post(url, init) {
        init.headers = this.mergeHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            // @ts-ignore
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
        /** @type {import('node-fetch').RequestInit} */
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
    postL(url, data = {}) {
        let body = {
            method: 'POST',
            url: `http://music.163.com/api${url}`,
            params: data
        };
        /** @type {import('node-fetch').RequestInit} */
        let init = {
            method: 'POST',
            headers: {
                Cookie: 'os=pc; osver=linux; appver=2.0.3.131777; channel=netease'
            },
            body: qs.stringify(encodeLinux(body))
        };
        return this.post('https://music.163.com/linux/forward', init);
    }

    /**
     * eapi request
     * @param {string} url
     * @param {object} data
     */
    async postE(url, data = {}) {
        url = `https://music.163.com/eapi${url}`;
        let body = Object.assign({ e_r: 'true' }, data);
        // default eapi cookies
        body.header = Object.assign({
            os: 'pc',
            osver: 'linux',
            appver: '2.0.3.131777',
            channel: 'netease'
        }, this.getCookie());
        /** @type {import('node-fetch').RequestInit} */
        let init = {
            method: 'POST',
            headers: {},
            body: ''
        };
        // encrypt request payload
        init.body = qs.stringify(encodeEApi(new URL(url).pathname, body));
        init.headers = this.mergeHeaders({
            'Cookie': 'os=pc; osver=linux; appver=2.0.3.131777; channel=netease',
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

export default HttpClient;

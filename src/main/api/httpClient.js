import debug from 'debug';
import fetch from 'electron-fetch';
import { CookieJar, CookieAccessInfo } from 'cookiejar';

import { encodeWeb, encodeLinux, encodeEApi, decodeEApi, getCacheKey } from './codec';

const d = debug('HTTP');

/**
 * @typedef {import('electron-fetch').RequestInit} RequestInit
 * @typedef {import('electron-fetch').Response} Response
 */

export default class HttpClient {

    static DesktopUserAgent = 'Mozilla/5.0 (Linux) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    static MobileUserAgent = 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

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
        this.cookieJar.setCookie('__remember_me=true');
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
            return Object.fromEntries(cookies.map(c => [c.name, c.value]));
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
     * @param {Response} res electron-fetch's `Response` object
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
        const res = await fetch(url, {
            method: 'GET',
            headers: this.mergeHeaders(config.headers)
        });
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
     * @param {RequestInit} init
     * @param {(r: Response) => Promise<any>} [decode]
     */
    async post(url, init, decode) {
        init.method = 'POST';
        init.headers = this.mergeHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(init.body)
        }, init.headers);
        const res = await fetch(url, init);
        this.handleResponse(res);
        const data = await (decode ? decode(res) : res.json());
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
        let body = Object.assign({}, data);
        const __csrf = this.getCookie('__csrf');
        if (__csrf) {
            url += `?csrf_token=${__csrf}`;
            body.csrf_token = __csrf;
        }
        return this.post(url, {
            body: encodeWeb(body)
        });
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
        return this.post('https://music.163.com/api/linux/forward', {
            headers: {
                Cookie: 'os=pc; osver=linux; appver=2.0.3.131777; channel=netease'
            },
            body: encodeLinux(body)
        });
    }

    /** @type {(r: Response) => Promise<any>} */
    static decodeEApiResponse = async r => JSON.parse(decodeEApi(await r.buffer()));

    /**
     * eapi request
     * @param {string} url
     * @param {object} data
     * @param {boolean} putCacheKey
     * @param {boolean} useInterfaceUrl
     */
    async postE(url, data = {}, putCacheKey = false, useInterfaceUrl = false) {
        if (useInterfaceUrl) {
            url = `https://interface.music.163.com/eapi${url}`;
        } else {
            url = `https://music.163.com/eapi${url}`;
        }
        let body = Object.assign({ e_r: 'true' }, data);
        if (putCacheKey) {
            body['cache_key'] = getCacheKey(body);
        }
        return this.post(url, {
            headers: {
                Cookie: 'os=android; osver=10.0.0; appver=8.20.30; mobilename=linux'
            },
            body: encodeEApi(new URL(url).pathname, body)
        }, HttpClient.decodeEApiResponse);
    }
}

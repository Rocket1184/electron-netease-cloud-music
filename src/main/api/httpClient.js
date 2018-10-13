import qs from 'querystring';
import { randomFillSync } from 'crypto';

import Axios from 'axios';
import Cookie from 'cookiejar';
import { encodeWeb, encodeLinux } from './codec';

class HttpClient {
    constructor() {
        this.initCookieJar();
    }

    initCookieJar() {
        const now = Date.now();
        const nuid = randomFillSync(Buffer.alloc(16)).toString('hex');
        this.cookieJar = new Cookie.CookieJar();
        this.cookieJar.setCookies([
            `JSESSIONID-WYYY=${randomFillSync(Buffer.alloc(132)).toString('base64')}:${now}`,
            `_iuqxldmzr=32`,
        ], '.music.163.com', '/');
        this.cookieJar.setCookies([
            `_ntes_nnid=${nuid},${now}`,
            `_ntes_nuid=${nuid}`
        ], '.163.com', '/');
    }

    get clientHeaders() {
        return {
            Accept: '*/*',
            'Accept-Language': 'zh',
            'Accept-Encoding': 'gzip',
            Cookie: this.getCookieString(),
            Referer: 'https://music.163.com/',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0'
        };
    }

    // clear all cookies, and set cookie as given arguments
    updateCookie(arg = {}) {
        this.initCookieJar();
        if (typeof arg === 'string' || Array.isArray(arg)) {
            this.cookieJar.setCookies(arg);
            return;
        }
        const cookies = [];
        for (const key in arg) {
            if (arg.hasOwnProperty(key)) {
                cookies.push(`${key}=${arg[key]}`);
            }
        }
        this.cookieJar.setCookies(cookies);
    }

    // set one or more cookie
    setCookie(...arg) {
        this.cookieJar.setCookies(...arg);
    }

    getCookie(key = '') {
        const cookies = this.cookieJar.getCookies(Cookie.CookieAccessInfo.All);
        if (key === '') {
            let result = {};
            cookies.forEach(c => result[c.name] = c.value);
            return result;
        }
        const c = cookies.find(c => c.name === key) || {};
        return c.value;
    }

    getCookieString() {
        const cookies = this.cookieJar.getCookies(Cookie.CookieAccessInfo.All);
        return cookies.map(c => c.toValueString()).join('; ');
    }

    handleResponse(response) {
        const pendingCookie = response.headers['set-cookie'];
        if (pendingCookie) {
            this.cookieJar.setCookies(response.headers['set-cookie']);
        }
    }

    post(config) {
        config.method = 'post';
        const __csrf = this.getCookie('__csrf');
        if (__csrf) {
            config.url += `?csrf_token=${__csrf}`;
            if (config.data) {
                config.data.csrf_token = __csrf;
            }
        }
        if (config.data) {
            if (config.encrypt === 'linux') {
                config.data = qs.stringify(encodeLinux(config.data));
            } else {
                config.data = qs.stringify(encodeWeb(config.data));
            }
        } else {
            config.data = '';
        }

        config.headers = Object.assign({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(config.data)
        }, this.clientHeaders, config.headers);

        return new Promise((resolve, reject) => {
            Axios(config).then(response => {
                this.handleResponse(response);
                resolve(response.data);
            }).catch(error => {
                reject(error);
            });
        });
    }

    get(urlOrConfig) {
        let config;
        if (typeof urlOrConfig === 'string')
            config = { url: urlOrConfig };
        else config = urlOrConfig;

        config.headers = Object.assign(this.clientHeaders, config.headers);

        return new Promise((resolve, reject) => {
            Axios(config).then(response => {
                this.handleResponse(response);
                resolve(response.data);
            }).catch(error => {
                reject(error);
            });
        });
    }
}

export default HttpClient;

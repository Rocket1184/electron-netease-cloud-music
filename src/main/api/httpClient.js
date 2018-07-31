import qs from 'querystring';

import Axios from 'axios';
import Cookie from 'cookie';
import { encodeWeb, encodeLinux } from './codec';

class HttpClient {
    constructor() {
        this.cookie = {};
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

    setCookie(arg) {
        switch (typeof arg) {
            case 'string':
                this.cookie = Cookie.parse(arg);
                break;
            case 'object':
                this.cookie = arg;
        }
    }

    updateCookie(arg) {
        if (Array.isArray(arg))
            arg = arg.join('; ').replace(/HttpOnly /g, '');
        if (typeof arg == 'string')
            arg = Cookie.parse(arg);
        for (let key in arg) {
            this.cookie[key] = arg[key];
        }
        delete this.cookie.Expires;
        delete this.cookie.Domain;
        delete this.cookie.Path;
    }

    getCookie(key = '') {
        if (key.length) {
            try {
                return this.cookie[key];
            }
            catch (err) {
                throw new Error(`[HttpClient] No such cookie '${key}'`);
            }
        } else {
            return this.cookie;
        }
    }

    getCookieString() {
        let result = '';
        for (let key in this.cookie) {
            result += `${key}=${this.cookie[key]}; `;
        }
        return result;
    }

    handleResponse(response) {
        this.updateCookie(response.headers['set-cookie']);
    }

    post(config) {
        config.method = 'post';
        if (this.cookie.__csrf) {
            config.url += `?csrf_token=${this.cookie.__csrf}`;
            if (config.data) {
                config.data.csrf_token = this.cookie.__csrf;
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

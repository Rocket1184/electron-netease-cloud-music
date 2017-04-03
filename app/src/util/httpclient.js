import qs from 'querystring';

import Axios from 'axios';
import Cookie from 'cookie';
import Codec from './codec';

class HttpClient {
    constructor() {
        this.cookie = {};
    }

    get clientHeaders() {
        return {
            Cookie: this.getCookieString(),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.157 Safari/537.36',
            Host: 'music.163.com',
            Accept: '*/*',
            Referer: 'http://music.163.com/',
            Connection: 'close'
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

    static mkEncodeData(payload) {
        return qs.stringify(Codec.encode(payload));
    }

    post(config) {
        config.method = 'post';
        config.data = HttpClient.mkEncodeData(config.data);

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
        if (typeof urlOrConfig == 'string')
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

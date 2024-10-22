/**
 * Netease Cloud Music Web(weapi)/Linux(forward) API Encrypt Module
 * Credit:
 * @see https://github.com/darknessomi/musicbox
 * @see https://github.com/metowolf/NeteaseCloudMusicApi
 * @see https://github.com/Copay/cloudmusicapi
 * @see https://github.com/surmon-china/simple-netease-cloud-music
 */

import crypto from 'crypto';
import qs from 'querystring';

const WeApi = {
    pk: BigInt('0x' + '010001'),
    md: BigInt('0x' + '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7'),
    /**
     * @param {bigint} a
     * @param {bigint} b
     * @param {bigint} mod
     */
    modPow(a, b = WeApi.pk, mod = WeApi.md) {
        let result = BigInt(1);
        for (let i = BigInt(0); i < b; i += BigInt(1)) {
            result = (result * a) % mod;
        }
        return result;
    },
    /**
     * @param {string} text
     * @param {string} key
     */
    aes(text, key) {
        const cipher = crypto.createCipheriv('aes-128-cbc', key, '0102030405060708');
        return cipher.update(text, 'utf8', 'base64') + cipher.final('base64');
    },
    /**
     * @param {string} text
     */
    rsa(text) {
        const textHex = Buffer.from(text.split('').reverse().join(''), 'utf8').toString('hex');
        const tb = BigInt('0x' + textHex);
        /** @type {string} */
        const rs = WeApi.modPow(tb).toString(16);
        return rs.padStart(256, '0');
    }
};

/**
 * @param {any} payload
 */
export function encodeWeb(payload) {
    const json = JSON.stringify(payload);
    const encJson = WeApi.aes(json, '0CoJUm6Qyw8W8jud');
    const secKey = crypto.randomFillSync(Buffer.alloc(12)).toString('base64');
    const params = WeApi.aes(encJson, secKey);
    const encSecKey = WeApi.rsa(secKey);
    return {
        params,
        encSecKey
    };
}

/**
 * @see https://github.com/surmon-china/simple-netease-cloud-music/blob/7e3beab480e637284f349c06efb4f18d00f2506f/src/netease.js#L288-L298
 * @param {any} payload
 */
export function encodeLinux(payload) {
    const json = JSON.stringify(payload);
    const cipher = crypto.createCipheriv('aes-128-ecb', 'rFgB&h#%2?^eDg:Q', null);
    const b64 = cipher.update(json, 'utf8', 'hex') + cipher.final('hex');
    return {
        eparams: b64.toUpperCase()
    };
}

/**
 * Netease Cloud Music EAPI Encode/Decode
 * Credit:
 * @see https://www.freebuf.com/articles/web/164636.html
 * @see https://github.com/nondanee/Glee/wiki/%E7%BD%91%E6%98%93%E4%BA%91eapi
 * @see https://juejin.im/post/5ac10c51f265da23a229408d
 * @see https://juejin.im/post/5b1b6e4b6fb9a01e87569e96
 */

const EApi = {
    key: 'e82ckenh8dichen8',
    /**
     * string hex md5 in lowercase
     * @param {string} text
     */
    md5(text) {
        return crypto.createHash('md5').update(text).digest('hex');
    }
};

/**
 * @param {string|Buffer} buffer
 */
export function decodeEApi(buffer) {
    const dc = crypto.createDecipheriv('aes-128-ecb', EApi.key, null);
    let text;
    if (buffer instanceof Buffer) {
        text = dc.update(buffer, undefined, 'utf8') + dc.final('utf8');
    } else if (typeof buffer === 'string') {
        text = dc.update(buffer, 'hex', 'utf8') + dc.final('utf8');
    }
    return text;
}

/**
 * @param {string} uri
 * @param {any} data
 */
export function encodeEApi(uri, data) {
    const prefix = uri.replace(/^\/eapi/, '/api');
    const json = JSON.stringify(data);
    const suffix = EApi.md5(`nobody${prefix}use${json}md5forencrypt`);
    const text = `${prefix}-36cd479b6b5-${json}-36cd479b6b5-${suffix}`;
    const cipher = crypto.createCipheriv('aes-128-ecb', EApi.key, null);
    /**
     * thanks to cipher's AutoPadding, we can just encrypt it as-is.
     * otherwise, we must pad it manually with PKCS#7:
     * ```js
     * const padLength = 16 - (text.length % 16);
     * const padText = text.padEnd(text.length + padLength, String.fromCharCode(padLength));
     * cipher.setAutoPadding(false);
     * const encText = cipher.update(padText, 'utf8', 'hex') + cipher.final('hex');
     * ```
     */
    const encText = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    return {
        params: encText.toUpperCase()
    };
}

/**
 * Netease Cloud Music EAPI `cache_key` generation
 * Credit: 
 * @see https://rocka.me/article/netease-cloud-music-cache-key-reverse
 */

/**
 * calculate eapi `cache_key` from params
 * @param {Record<string, any>} params
 */
export function getCacheKey(params) {
    const keys = Object.keys(params).sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
    /** @type {Record<string, string>} */
    const record = {};
    for (const k of keys) {
        record[k] = params[k];
    }
    const text = qs.stringify(record);
    const cipher = crypto.createCipheriv('aes-128-ecb', ')(13daqP@ssw0rd~', null);
    const key = cipher.update(text, 'utf8', 'base64') + cipher.final('base64');
    return key;
}

/**
 * calculate picture hash from picture id
 * `https://p{1,2,3,4}.music.126.net/${hash}/${id}.jpg`
 * 
 * Credit:
 * @see https://github.com/metowolf/Meting
 * 
 * @param {string | number} id
 */
export function encodePicUrl(id) {
    const key = Buffer.from('3go8&$8*3*3h0k(2)2', 'utf8');
    const bytes = Buffer.from(`${id}`, 'utf8');
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = bytes[i] ^ key[i % key.length];
    }
    const hash = crypto.createHash('md5');
    const md5 = hash.update(bytes).digest('base64');
    // node's base64url would omit padding char '='
    return md5.replaceAll('/', '_').replaceAll('+', '-');
}

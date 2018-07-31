/*
 *	Netease Cloud Music API Private Encrypt Module
 *
 *  Thanks TO:
 *  | Project              | URL                                              |
 *  | -------------------- | ------------------------------------------------ |
 *  | musicbox             | https://github.com/darknessomi/musicbox          |
 *  | NeteaseCloudMusicApi | https://github.com/metowolf/NeteaseCloudMusicApi |
 *  | cloudmusicapi        | https://github.com/Copay/cloudmusicapi           |
 *
 */

import crypto from 'crypto';
import Bigint from 'big-integer';

const modulus = '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';
const nonce = '0CoJUm6Qyw8W8jud';
const aesIv = '0102030405060708';
const pubKey = '010001';

function createSecretKey() {
    return crypto.randomFillSync(Buffer.alloc(12)).toString('base64');
}

function aesEncrypt(text, secKey) {
    let cipher = crypto.createCipheriv('aes-128-cbc', secKey, aesIv);
    cipher.setAutoPadding(true);
    return cipher.update(text, 'utf8', 'base64') + cipher.final('base64');
}

function rsaEncrypt(text) {
    text = text.split('').reverse().join('');
    let textHex = new Buffer(text).toString('hex');
    let tb = Bigint(textHex, 16);
    let pk = Bigint(pubKey, 16);
    let md = Bigint(modulus, 16);
    let rs = tb.modPow(pk, md).toString(16);
    return rs.padStart(256, '0');
}

export function encodeWeb(payload) {
    let json = JSON.stringify(payload);
    let secKey = createSecretKey();
    let encSecKey = rsaEncrypt(secKey);
    let encText = aesEncrypt(json, nonce);
    encText = aesEncrypt(encText, secKey);
    return {
        params: encText,
        encSecKey
    };
}

/**
 * credit: https://github.com/surmon-china/simple-netease-cloud-music/blob/7e3beab480e637284f349c06efb4f18d00f2506f/src/netease.js#L288-L298
 */
export function encodeLinux(payload) {
    const json = JSON.stringify(payload);
    const cipher = crypto.createCipheriv('aes-128-ecb', 'rFgB&h#%2?^eDg:Q', '');
    const b64 = cipher.update(json, 'utf8', 'hex') + cipher.final('hex');
    return {
        eparams: b64.toUpperCase()
    };
}

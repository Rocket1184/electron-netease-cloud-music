import debug from 'debug';

import { encm } from '@/util/globals';

const TAG = 'API';
const d = debug(TAG);

let resolveId = 0;
const resolveMap = new Map();

encm.on(TAG, (event, /** @type {number} */ id, data) => {
    d('🔻 %d %o', id, data);
    if (resolveMap.has(id)) {
        resolveMap.get(id).call(null, data);
        resolveMap.delete(id);
    }
});

/**
 * @param {string} methodName
 * @param  {...any} args
 */
export function send(methodName, ...args) {
    resolveId++;
    return new Promise(resolve => {
        resolveMap.set(resolveId, resolve);
        encm.send(TAG, methodName, resolveId, ...args);
        d('🔺 %d %s %o', resolveId, methodName, args);
    });
}

const fns = {};

const Api = new Proxy(fns, {
    get(_, propName) {
        return fns[propName] ??= send.bind(null, propName);
    }
});

export default Api;

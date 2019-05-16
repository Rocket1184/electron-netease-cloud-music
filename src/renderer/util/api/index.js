import debug from 'debug';
import { ipcRenderer } from 'electron';

import * as track from './database/track';

const TAG = 'API';
const d = debug(TAG);

let resolveId = 0;

const methodMap = new Map();
const resolveMap = new Map();

ipcRenderer.on(TAG, (_, /** @type {number} */ id, data) => {
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
function senderFn(methodName, ...args) {
    resolveId++;
    return new Promise(resolve => {
        resolveMap.set(resolveId, resolve);
        ipcRenderer.send(TAG, methodName, resolveId, ...args);
        d('🔺 %d %s %o', resolveId, methodName, args);
    });
}

/** @type {import('./index').default} */
// @ts-ignore
const Api = new Proxy({}, {
    get(_, propName) {
        if (methodMap.has(propName)) {
            return methodMap.get(propName);
        }
        const fn = senderFn.bind(null, propName);
        methodMap.set(propName, fn);
        return fn;
    }
});

/**
 * @param {number[]} ids
 */
export async function bulkTrackDetail(ids) {
    try {
        return await track.get(ids);
    } catch (missed) {
        const tasks = [];
        for (let i = 0; i < missed.length; i += 1000) {
            const ids = missed.slice(i, i + 1000);
            const promise = Api.getSongDetail(ids).then(resp => {
                if (resp.code === 200) {
                    track.insert(resp.songs);
                }
            });
            tasks.push(promise);
        }
        await Promise.all(tasks);
        return bulkTrackDetail(ids);
    }
}

methodMap.set(bulkTrackDetail.name, bulkTrackDetail);

export default Api;

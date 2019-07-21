import debug from 'debug';
import { ipcRenderer } from 'electron';

const TAG = 'API';
const d = debug(TAG);

let resolveId = 0;
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
export function send(methodName, ...args) {
    resolveId++;
    return new Promise(resolve => {
        resolveMap.set(resolveId, resolve);
        ipcRenderer.send(TAG, methodName, resolveId, ...args);
        d('🔺 %d %s %o', resolveId, methodName, args);
    });
}

const Api = new Proxy({}, {
    get(_, propName) {
        return send.bind(null, propName);
    }
});

export default Api;

import Worker from './worker';

let resolveId = 0;
const ResolveMap = new Map();
const worker = new Worker();

/**
 * @typedef {keyof import('./worker')} WorkerMethodNames
 */

/**
 * @param {WorkerMethodNames} method
 * @param {any[]} args
 */
export function workerExecute(method, ...args) {
    resolveId++;
    return new Promise(resolve => {
        ResolveMap.set(resolveId, resolve);
        worker.postMessage({ method, args, id: resolveId });
    });
}

worker.addEventListener('message', ev => {
    const { id, result } = ev.data;
    if (ResolveMap.has(id)) {
        ResolveMap.get(id).call(null, result);
        ResolveMap.delete(id);
    }
});

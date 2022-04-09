let resolveId = 0;
const ResolveMap = new Map();
const worker = new Worker(new URL('./worker', import.meta.url));

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
    const resolve = ResolveMap.get(id);
    if (resolve) {
        resolve.call(null, result);
        ResolveMap.delete(id);
    }
});

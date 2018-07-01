import debug from 'debug';
import { ipcRenderer } from 'electron';

const TAG = 'Api';
const d = debug(TAG);

let invokeId = 0;

const methodMap = new Map();
const actionMap = new Map();

ipcRenderer.on(TAG, (event, id, data) => {
    if (actionMap.has(id)) {
        d('🔻 %d %o', id, data);
        const action = actionMap.get(id);
        action(data);
        actionMap.delete(id);
    }
});

function senderFn(methodName, ...args) {
    invokeId++;
    return new Promise(resolve => {
        actionMap.set(invokeId, resolve);
        ipcRenderer.send(TAG, methodName, invokeId, ...args);
        d('🔺 %d %s %o', invokeId, methodName, args);
    });
}

const modules = new Proxy({}, {
    get(_, propName) {
        if (methodMap.has(propName)) {
            return methodMap.get(propName);
        }
        const fn = senderFn.bind(this, propName);
        methodMap.set(propName, fn);
        return fn;
    }
});

export default modules;

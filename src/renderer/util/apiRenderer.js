import { ipcRenderer } from 'electron';

const methodKeys = ipcRenderer.sendSync('getApiKeys');
const modules = {};

let invokeId = Date.now();
const shouldLog = process.env.NODE_ENV !== 'production';

methodKeys.forEach(methodName => {
    modules[methodName] = function (...args) {
        invokeId++;
        // eslint-disable-next-line no-console
        if (shouldLog) console.info('🔺', methodName, args);
        return new Promise((resolve, reject) => {
            ipcRenderer.once(`${methodName}${invokeId}`, (event, data) => {
                // eslint-disable-next-line no-console
                if (shouldLog) console.info('🔻', methodName, data);
                if (data.errno) reject(data);
                else resolve(data);
            });
            ipcRenderer.send(methodName, invokeId, ...args);
        });
    };
});

export default modules;

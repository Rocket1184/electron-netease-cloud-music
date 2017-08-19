import { ipcRenderer } from 'electron';

const methodKeys = ipcRenderer.sendSync('getApiKeys');
const modules = {};

let invokeId = Date.now();

methodKeys.forEach(methodName => {
    modules[methodName] = function (...args) {
        invokeId++;
        return new Promise((resolve, reject) => {
            ipcRenderer.once(`${methodName}${invokeId}`, (event, data) => {
                if (!process.env.PRODUCTION) console.info(methodName, data);
                if (data.errno) reject(data);
                else resolve(data);
            });
            ipcRenderer.send(methodName, invokeId, ...args);
        });
    };
});

export default modules;

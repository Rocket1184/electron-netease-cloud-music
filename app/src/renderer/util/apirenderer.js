import { ipcRenderer } from 'electron';
import Api from '../../main/api/api';

const methodKeys = Object.getOwnPropertyNames(Api);
const modules = {};

methodKeys.forEach(methodName => {
    modules[methodName] = function (...args) {
        return new Promise((resolve) => {
            ipcRenderer.once(methodName, (event, data) => {
                console.info(methodName, data);
                resolve(data);
            });
            ipcRenderer.send(methodName, ...args);
        });
    };
});

export default modules;

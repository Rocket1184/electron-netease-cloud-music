import { ipcRenderer } from 'electron';
import ApiHost from './apihost';

const methodKeys = Object.getOwnPropertyNames(ApiHost);

let xprts = {};

methodKeys.forEach(methodName => {
    xprts[methodName] = function (...args) {
        return new Promise((resolve) => {
            ipcRenderer.once(methodName, (event, data) => {
                console.info(methodName, data);
                resolve(data);
            });
            ipcRenderer.send(methodName, ...args);
        });
    };
});

export default xprts;

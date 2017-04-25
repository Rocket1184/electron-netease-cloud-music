import { ipcMain } from 'electron';
import Api from './api';

const methodKeys = Object.getOwnPropertyNames(Api);

async function rejectTimeout(timeOut = 5000) {
    return await new Promise((_, reject) => {
        setTimeout(() => {
            reject(`request time out after ${timeOut} ms`);
        }, timeOut);
    });
}

methodKeys.map(methodName => {
    ipcMain.on(methodName, (event, ...args) => {
        Promise.race([
            Api[methodName](...args),
            rejectTimeout()
        ]).then(data => {
            event.sender.send(methodName, data);
        }).catch(err => {
            event.sender.send(methodName, err);
        });
    });
});

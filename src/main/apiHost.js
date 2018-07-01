import debug from 'debug';
import { ipcMain } from 'electron';

import * as Api from './api';

const TAG = 'Api';
const d = debug(TAG);

async function rejectTimeout(timeOut = 60000) {
    return await new Promise((_, reject) => {
        setTimeout(() => {
            reject(`request time out after ${timeOut} ms`);
        }, timeOut);
    });
}

ipcMain.on(TAG, (event, methodName, invokeId, ...args) => {
    d('↓ %s', methodName);
    Promise.race([
        Api[methodName](...args),
        rejectTimeout()
    ]).then(data => {
        event.sender.send(TAG, invokeId, data);
        d('↑ %s', methodName);
    }).catch(err => {
        event.sender.send(TAG, invokeId, err);
        d('× %s %j', methodName, err);
    });
});

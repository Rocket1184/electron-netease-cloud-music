import debug from 'debug';
import { ipcMain } from 'electron';

import * as API from './api';

const TAG = 'API';
const d = debug(TAG);

async function rejectTimeout(timeOut = 60000) {
    return await new Promise((_, reject) => {
        setTimeout(() => {
            reject({ code: -1, msg: `request time out after ${timeOut} ms` });
        }, timeOut);
    });
}

ipcMain.on(TAG, (event, methodName, invokeId, ...args) => {
    d('↓ %s', methodName);
    Promise.race([
        API[methodName](...args),
        rejectTimeout()
    ]).then(data => {
        event.sender.send(TAG, invokeId, data);
        d('↑ %s', methodName);
    }).catch(err => {
        event.sender.send(TAG, invokeId, err);
        d('× %s %s', methodName, err.stack);
    });
});

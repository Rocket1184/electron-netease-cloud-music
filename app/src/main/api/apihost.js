import { ipcMain } from 'electron';
import Api from './api';

const methodKeys = Object.getOwnPropertyNames(Api);

methodKeys.map(methodName => {
    ipcMain.on(methodName, async (event, ...args) => {
        const data = await Api[methodName](...args);
        event.sender.send(methodName, data);
    });
});

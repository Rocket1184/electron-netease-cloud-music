import { ipcMain } from 'electron';
import ApiHost from './apihost';

const methodKeys = Object.getOwnPropertyNames(ApiHost);

methodKeys.map(methodName => {
    ipcMain.on(methodName, async (event, ...args) => {
        const data = await ApiHost[methodName](...args);
        console.info(methodName, data);
        event.sender.send(methodName, data);
    });
});

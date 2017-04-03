import { ipcRenderer } from 'electron';

function getMusicRecord(uid) {
    return new Promise((resolve) => {
        ipcRenderer.once('getMusicRecord', (event, data) => {
            resolve(data);
        });
        ipcRenderer.send('getMusicRecord', uid);
    });
};

function getDailySuggestions() {
    return new Promise((resolve) => {
        ipcRenderer.once('getDailySuggestions', (event, data) => {
            resolve(data);
        });
        ipcRenderer.send('getDailySuggestions');
    });
}

export default {
    getMusicRecord,
    getDailySuggestions
};

import Client from './httpclient';

const client = new Client();
client.setCookie({
    os: 'pc',
    osver: 'Microsoft-Windows-10-Professional-build-10586-64bit',
    appver: '2.0.3.131777',
    channel: 'netease',
    __remember_me: 'true'
});

async function getMusicRecord(uid) {
    return await client.post({
        url: 'http://music.163.com/weapi/v1/play/record?csrf_token=',
        data: {
            uid,
            type: 0,
            csrf_token: ''
        }
    });
}

async function getDailySuggestions() {
    return await new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    id: 28243624,
                    name: 'ありふれたせかいせいふく',
                    artistName: 'ピノキオP'
                }
            ]);
        }, 500);
    });
}

export default {
    getMusicRecord, getDailySuggestions
};

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

function getDailySuggestions() {
    return [
        {
            id: 28243624,
            name: 'ありふれたせかいせいふく',
            artistName: 'ピノキオP'
        },
        {
            id: 27950383,
            name: 'FREELY TOMORROW',
            artistName: 'Mitchie M'
        },
        {
            id: 26219539,
            name: 'こちら、幸福安心委员会です.',
            artistName: 'うたたP'
        },
        {
            id: 22699101,
            name: '里表ラバーズ (reverse Edge mix by キャプテンミライ) - remix',
            artistName: 'wowaka'
        },
        {
            id: 29747141,
            name: 'End of the World',
            artistName: 'papiyon'
        },
        {
            id: 29719542,
            name: '文字恋',
            artistName: 'GUMI'
        },
        {
            id: 29017142,
            name: '文学者の恋文',
            artistName: 'doriko'
        },
        {
            id: 28936917,
            name: '精神崩壊シンドローム',
            artistName: '初音ミク'
        },
        {
            id: 28382729,
            name: '1/6 -out of the gravity-',
            artistName: 'ぼーかりおどP'
        },
        {
            id: 28063259,
            name: 'WAVE',
            artistName: '鏡音リン'
        }
    ];
}

export default {
    getMusicRecord, getDailySuggestions
};

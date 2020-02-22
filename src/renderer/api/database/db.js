import Dexie from 'dexie';

export const db = new Dexie('electron-ncm');

db.version(3).stores({
    tracks: 'id',
    lyric: 'id',
    radio: 'track.id, index',
    playlist: 'track.id, index'
}).upgrade(async trans => {
    const { Track } = await import('@/util/models');
    await trans.table('radio').toCollection().modify(obj => {
        obj.track = new Track(obj.track);
    });
    await trans.table('playlist').toCollection().modify(obj => {
        obj.track = new Track(obj.track);
    });
});

db.version(2).stores({
    tracks: 'id',
    lyric: 'id',
    radio: 'track.id, index',
    playlist: 'track.id, index'
});

db.version(1).stores({ tracks: 'id' });

export const trackTable = db.table('tracks');
export const lyricTable = db.table('lyric');
export const radioTable = db.table('radio');
export const playlistTable = db.table('playlist');

import Dexie from 'dexie';

export const db = new Dexie('electron-ncm');
db.version(2).stores({
    tracks: 'id',
    // lyric: 'id',
    radio: 'track.id, index',
    playlist: 'track.id, index'
});

db.version(1).stores({ tracks: 'id' });

export const trackTable = db.table('tracks');
export const radioTable = db.table('radio');
export const playlistTable = db.table('playlist');

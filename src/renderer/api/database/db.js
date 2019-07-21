import Dexie from 'dexie';

export const db = new Dexie('electron-ncm');
db.version(2).stores({
    tracks: 'id',
    // lyric: 'id',
    playlist: 'track.id, index',
    // radio: 'id'
});

db.version(1).stores({ tracks: 'id' });

export const trackTable = db.table('tracks');
export const playlistTable = db.table('playlist');

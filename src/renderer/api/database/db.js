import Dexie from 'dexie';

const db = new Dexie('electron-ncm');
db.version(1).stores({ tracks: 'id' });

export const trackTable = db.table('tracks');

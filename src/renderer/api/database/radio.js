import { db, radioTable } from './db';
import { wrapTracks, getIndexedTrack } from './helpers';

/**
 * @typedef {import('./helpers').TrackWithIndex} RadioRecord
 */

export function clear() {
    return radioTable.clear();
}

/**
 * @param {Models.Track[]} tracks 
 */
export function replace(tracks) {
    return db.transaction('rw', radioTable, async () => {
        await radioTable.clear();
        await radioTable.bulkAdd(wrapTracks(tracks));
    });
}

/**
 * @param {Models.Track[]} tracks
 */
export function append(tracks) {
    return db.transaction('rw', radioTable, async () => {
        /** @type {RadioRecord[]} */
        const exists = await radioTable
            .where('track.id')
            .anyOf(tracks.map(t => t.id))
            .toArray();
        const uniq = tracks.filter(track => exists.findIndex(e => e.track.id === track.id) < 0);
        if (uniq.length <= 0) return;
        /** @type {RadioRecord} */
        const last = await radioTable
            .orderBy('index')
            .last();
        const offset = last ? last.index + 1 : 0;
        await radioTable.bulkAdd(wrapTracks(uniq, offset));
    });
}

/**
 * @param {number} target
 */
export function trim(target = 150) {
    return db.transaction('rw', radioTable, async () => {
        const count = await radioTable.count();
        if (target >= count) return;
        await radioTable
            .orderBy('index')
            .limit(count - target)
            .delete();
    });
}

/**
 * @param {number} id
 */
export function remove(id) {
    return db.transaction('rw', radioTable, async () => {
        await radioTable
            .where('track.id')
            .equals(id)
            .delete();
    });
}

/**
 * @returns {Promise<Models.Track[]>}
 */
export function get() {
    return getIndexedTrack(radioTable);
}

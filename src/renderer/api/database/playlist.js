import { db, playlistTable } from './db';

/**
 * @param {Models.Track[]} tracks 
 * @param {number} offset
 */
function wrapTracks(tracks, offset = 0) {
    return tracks.map((track, index) => {
        return {
            index: offset + index,
            track
        };
    });
}

export function clear() {
    return playlistTable.clear();
}

/**
 * @param {Models.Track[]} tracks 
 */
export function replace(tracks) {
    return db.transaction('rw', playlistTable, async () => {
        await playlistTable.clear();
        await playlistTable.bulkAdd(wrapTracks(tracks));
    });
}

/**
 * @param {number} index
 * @param {Models.Track[]} tracks
 */
export function insert(index, tracks) {
    return db.transaction('rw', playlistTable, async () => {
        const exists = await playlistTable
            .where('track.id')
            .anyOf(tracks.map(t => t.id))
            .toArray();
        const uniq = tracks.filter(a => exists.findIndex(e => a.id === e.id) < 0);
        const count = uniq.length;
        const pendingItems = await playlistTable
            .where('index')
            .aboveOrEqual(index)
            .toArray();
        const pendingIds = pendingItems.map(item => item.track.id);
        await playlistTable
            .where('track.id')
            .anyOf(pendingIds)
            .modify(item => item.index += count);
        await playlistTable.bulkAdd(wrapTracks(uniq, index));
    });
}

/**
 * @param {number} index
 * @param {number} count
 */
export function remove(index, count = 1) {
    const range = [[index, index + count]];
    return db.transaction('rw', playlistTable, async () => {
        await playlistTable
            .where('index')
            .inAnyRange(range)
            .delete();
        const pendingItems = await playlistTable
            .where('index')
            .aboveOrEqual(index + count)
            .toArray();
        const pendingIds = pendingItems.map(item => item.track.id);
        await playlistTable
            .where('track.id')
            .anyOf(pendingIds)
            .modify(item => item.index -= count);
    });
}

/**
 * @returns {Promise<Models.Track[]>}
 */
export async function get() {
    const arr = await playlistTable.toArray();
    arr.sort((a, b) => a.index - b.index);
    const tracks = arr.map(a => a.track);
    return tracks;
}

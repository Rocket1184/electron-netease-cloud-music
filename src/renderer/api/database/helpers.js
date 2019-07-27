/**
 * @typedef {{index: number; track: Models.Track}} TrackWithIndex
 */

/**
 * @param {Models.Track[]} tracks 
 * @param {number} offset
 * @returns {TrackWithIndex[]}
 */
export function wrapTracks(tracks, offset = 0) {
    return tracks.map((track, index) => {
        return {
            index: offset + index,
            track
        };
    });
}

/**
 * @param {import('dexie').Dexie.Table} table
 * @returns {Promise<Models.Track[]>}
 */
export async function getIndexedTrack(table) {
    /** @type {TrackWithIndex[]} */
    const arr = await table.toArray();
    arr.sort((a, b) => a.index - b.index);
    const tracks = arr.map(a => a.track);
    return tracks;
}

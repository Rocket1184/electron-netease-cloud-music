import diff from 'lodash.difference';

import { trackTable } from './db';

/**
 * @param {Types.TrackDetail[]} tracks 
 */
export function insert(tracks) {
    return trackTable.bulkAdd(tracks);
}

/**
 * @param {Types.TrackDetail[]} tracks 
 */
export function upsert(tracks) {
    return trackTable.bulkPut(tracks);
}

/**
 * @param {number[]} ids
 * @param {boolean} [ignoreMissing=false] should throw error when database miss
 * @returns {Promise<Types.TrackDetail[]>} raw track detail
 * @throws {number[]} database missed track ids
 */
export async function get(ids, ignoreMissing = false) {
    const res = await trackTable.where('id').anyOf(ids).toArray();
    if (!ignoreMissing && res.length < ids.length) {
        const missed = diff(ids, res.map(t => t.id));
        throw missed;
    }
    const map = new Map();
    for (let i = 0; i < ids.length; i++) {
        map.set(ids[i], i);
    }
    res.sort((a, b) => map.get(a.id) - map.get(b.id));
    return res;
}

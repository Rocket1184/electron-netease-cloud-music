/** @type {Map<string, Function>} */
const MethodMap = new Map();

/**
 * filter track name and aritst name by given keyword
 * @param {string} w key word
 * @param {Models.Track[]} tracks
 */
export function filterTracks(w, tracks) {
    const kw = w.toLowerCase();
    const result = [];
    const indexMap = new Map();
    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.name.toLowerCase().includes(kw) ||
            track.artistName.toLowerCase().includes(kw)) {
            indexMap.set(result.length, i);
            result.push(track);
        }
    }
    return { result, indexMap };
}

MethodMap.set('filterTracks', filterTracks);

self.onmessage = function (ev) {
    const method = MethodMap.get(ev.data.method);
    if (method) {
        const result = method.apply(null, ev.data.args);
        const msg = { id: ev.data.id, method: ev.data.method, result };
        // @ts-ignore
        self.postMessage(msg);
    }
};

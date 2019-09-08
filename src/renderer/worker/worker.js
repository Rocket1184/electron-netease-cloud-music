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

const oscvs = new OffscreenCanvas(64, 64);
const oscvsCtx = oscvs.getContext('2d');

/**
 * @param {ImageBitmapSource} bms
 * @returns {Promise<number>}
 * @see https://stackoverflow.com/a/596243/8370777
 */
export async function determineBrightness(bms) {
    const bm = await createImageBitmap(bms);
    oscvsCtx.drawImage(bm, 0, 0, 64, 64);
    const dt = oscvsCtx.getImageData(0, 0, 64, 64);
    let brightness = 0;
    let rgb = [0, 0, 0];
    for (let i = 0; i < dt.data.length; i += 4) {
        rgb[0] += dt.data[i];
        rgb[1] += dt.data[i + 1];
        rgb[2] += dt.data[i + 2];
    }
    brightness = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 4096;
    oscvsCtx.clearRect(0, 0, 64, 64);
    return brightness;
}

MethodMap.set('determineBrightness', determineBrightness);

self.onmessage = async (ev) => {
    const method = MethodMap.get(ev.data.method);
    if (method) {
        const result = await method.apply(null, ev.data.args);
        const msg = { id: ev.data.id, method: ev.data.method, result };
        // @ts-ignore
        self.postMessage(msg);
    }
};

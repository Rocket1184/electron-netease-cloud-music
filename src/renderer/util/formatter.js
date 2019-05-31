/**
 * format timestamp to `yyyy/mm/dd`
 * @param {number} timeStamp
 */
export function shortDate(timeStamp) {
    const dt = new Date(timeStamp);
    return dt.toLocaleDateString('zh', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '-');
}

/**
 * format millisecond to `(h:)mm:ss`
 * @param {number} ms
 */
export function shortTime(ms) {
    if (typeof ms !== 'number') return '00:00';
    const dt = new Date(ms);
    return dt.toLocaleTimeString('zh', {
        hour12: false,
        timeZone: 'utc',
        hour: ms > 3600000 ? 'numeric' : undefined,
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * format byte size to `aa.bb KB/MB/GB/TB`
 * @param {number} val
 */
export function humanSize(val) {
    let i;
    const unit = ['', 'K', 'M', 'G', 'T'];
    for (i = 0; i < unit.length; i++) {
        if (val < 1000) break;
        else val /= 1024;
    }
    return `${val.toFixed(1)} ${unit[i]}B`;
}

/**
 * format count to `几万`
 * @param {number} val
 */
export function humanCount(val) {
    if (val < 100000) return Math.trunc(val).toString();
    return `${Math.trunc(val / 10000)}万`;
}

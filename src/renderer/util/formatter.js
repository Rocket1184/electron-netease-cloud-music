export function shortDate(timeStamp) {
    const dt = new Date(timeStamp);
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;
    const d = dt.getDate();
    return `${y}-${m}-${d}`;
}

export function shortTime(seconds) {
    const dt = new Date(seconds * 1000);
    const h = dt.getUTCHours();
    const m = dt.getMinutes();
    const s = dt.getSeconds();
    let res = '';
    h && (res += `${h}:`);
    res += m < 10 ? `0${m}:` : `${m}:`;
    res += s < 10 ? `0${s}` : `${s}`;
    return res;
}

export function humanSize(val) {
    let i;
    const unit = ['', 'K', 'M', 'G', 'T'];
    for (i = 0; i < unit.length; i++) {
        if (val < 1000) break;
        else val /= 1024;
    }
    return `${val.toFixed(1)} ${unit[i]}B`;
}

export function humanCount(val) {
    if (val < 100000) return Math.trunc(val);
    return `${Math.trunc(val / 10000)}万`;
}

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

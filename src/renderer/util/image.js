export function sizeImg(url, width, height = width) {
    if (url === null || url === undefined) url = '';
    if (url.startsWith('http:')) url = 'https' + url.slice(4);
    return `${url}?param=${width}y${height}`;
}

export function bkgImg(url) {
    if (url === null || url === undefined) url = '';
    return `background-image:url(${url})`
}

export function blurImg(id, width, height = width) {
    return `https://music.163.com/api/img/blur/${id}?param=${width}y${height}`;
}

export function HiDpiPx(px) {
    return px * window.devicePixelRatio;
}

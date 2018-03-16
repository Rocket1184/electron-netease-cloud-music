export function getImgSizeOf(url = '', width, height = width) {
    if (url.startsWith('http:')) {
        return `https${url.slice(4)}?param=${width}y${height}`;
    }
    return `${url}?param=${width}y${height}`;
}

export function blurImg(id, width, height = width) {
    return `https://music.163.com/api/img/blur/${id}?param=${width}y${height}`;
}

export function HiDpiPx(px) {
    return px * window.devicePixelRatio;
}

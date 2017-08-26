export function getImgSizeOf(url, width, height = width) {
    return `${url}?param=${width}y${height}`;
}

export function blurImg(id, width, height = width) {
    return `http://music.163.com/api/img/blur/${id}?param=${width}y${height}`;
}

export function HiDpiPx(px) {
    return px * window.devicePixelRatio;
}

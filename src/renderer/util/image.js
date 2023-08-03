/**
 * @param {string} url
 * @param {number} width
 * @param {number} height
 */
export function sizeImg(url, width, height = width) {
    if (!url) return '';
    if (process.env.NODE_ENV === 'development') {
        if (url.startsWith('http://localhost:')) {
            return url;
        }
    }
    if (url.startsWith('http:')) url = 'https' + url.slice(4);
    return `${url}?param=${width.toFixed(0)}y${height.toFixed(0)}`;
}

/**
 * @param {string} url
 */
export function bkgImg(url) {
    if (!url) return '';
    return `background-image:url(${url})`;
}

/**
 * @param {number|string} id
 * @param {number} width
 * @param {number} height
 */
export function blurImg(id, width, height = width) {
    return `https://music.163.com/api/img/blur/${id}?param=${width}y${height}`;
}

/**
 * @param {number} px
 */
export function HiDpiPx(px) {
    return px * window.devicePixelRatio;
}

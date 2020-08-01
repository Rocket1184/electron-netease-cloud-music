
export const getMIMEType = (buf) => {
    if (buf[0] === 0x89 && buf[1] === 0x50 &&
        buf[2] === 0x4E && buf[3] === 0x47) {
        return 'image/png';
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
        return 'image/jpeg';
    }
    return 'unknown';
}

export const getJPEGSize = (buf) => {
    const index = buf.indexOf('\xff\xc0');
    if (index === -1) {
        return { width: 0, height: 0 };
    }
    return {
        width: parseUint16(buf.slice(index + 5, index + 7)),
        height: parseUint16(buf.slice(index + 7, index + 9)),
    }
}

export const getPNGSize = (buf) => {
    return {
        width: parseUint32(buf.slice(16, 20)),
        height: parseUint32(buf.slice(20, 24)),
    }
}

export const getJPEGColorDepth = (buf) => {
    const index = buf.indexOf('\xff\xc0');
    if (index === -1) {
        return 0;
    }
    return parseUint8(buf.slice(index + 4, index + 5))
         * parseUint8(buf.slice(index + 9, index + 10));
}

export const getPNGColorDepth = (buf) => {
    const bitDepth = parseUint8(buf.slice(24, 25));
    const colorType = parseUint8(buf.slice(25, 26));
    if (colorType === 2) return bitDepth * 3; // RGB
    if (colorType === 6) return bitDepth * 4; // RGBA
    return bitDepth;
}

export const parseUint8 = (buf) => {
    return buf[0];
}
export const parseUint16 = (buf) => {
    return buf[0] * 0x0100 + buf[1] * 0x0001;
}
export const parseUint32 = (buf) => {
    return buf[0] * 0x01000000
         + buf[1] * 0x00010000
         + buf[2] * 0x00000100
         + buf[3] * 0x00000001;
}

export const uint32toBuffer = (x) => {
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(x);
    return buf;
}

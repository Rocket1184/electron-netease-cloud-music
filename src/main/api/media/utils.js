
/**
 * Check the file type of the given image
 * @param {Buffer} buf 
 * @returns {'image/png' | 'image/jpeg' | 'unknown'}
 */
export function getMIMEType(buf) {
    if (buf[0] === 0x89 && buf[1] === 0x50 &&
        buf[2] === 0x4E && buf[3] === 0x47) {
        return 'image/png';
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
        return 'image/jpeg';
    }
    return 'unknown';
}

/**
 * @typedef ImageSize
 * @type {object}
 * @property {number} width
 * @property {number} height
 */

/**
 * Get the size of a JPEG file
 * @param {Buffer} buf 
 * @returns {ImageSize}
 */
export function getJPEGSize(buf) {
    const index = buf.indexOf('\xff\xc0');
    if (index === -1) {
        return { width: 0, height: 0 };
    }
    return {
        width: parseUint16(buf.slice(index + 5, index + 7)),
        height: parseUint16(buf.slice(index + 7, index + 9)),
    };
}

/**
 * Get the size of a PNG file
 * @param {Buffer} buf 
 * @returns {ImageSize}
 */
export function getPNGSize(buf) {
    return {
        width: parseUint32(buf.slice(16, 20)),
        height: parseUint32(buf.slice(20, 24)),
    };
}

/**
 * Get the color depth of a JPEG file
 * @param {Buffer} buf 
 * @returns {number}
 */
export function getJPEGColorDepth(buf) {
    const index = buf.indexOf('\xff\xc0');
    if (index === -1) {
        return 0;
    }
    return parseUint8(buf.slice(index + 4, index + 5))
         * parseUint8(buf.slice(index + 9, index + 10));
}

/**
 * Get the color depth of a PNG file
 * @param {Buffer} buf 
 * @returns {number}
 */
export function getPNGColorDepth(buf) {
    const bitDepth = parseUint8(buf.slice(24, 25));
    const colorType = parseUint8(buf.slice(25, 26));
    if (colorType === 2) return bitDepth * 3; // RGB
    if (colorType === 6) return bitDepth * 4; // RGBA
    return bitDepth;
}

/**
 * `$xx`
 * @param {Buffer} buf
 * @returns {number} 
 */
export function parseUint8(buf) {
    return buf[0];
}

/**
 * `$xx xx`
 * @param {Buffer} buf
 * @returns {number} 
 */
export function parseUint16(buf) {
    return (buf[0] << 8) | buf[1];
}

/**
 * `$xx xx xx`
 * @param {Buffer} buf
 * @returns {number} 
 */
export function parseUint24(buf) {
    return (buf[0] << 16)
         | (buf[1] <<  8)
         | (buf[2]      );
}

/**
 * 4 * `%0xxxxxxx`
 * @param {Buffer} buf
 * @returns {number} 
 */
export function parseUint28(buf) {
    return (buf[0] << 21)
         | (buf[1] << 14)
         | (buf[2] <<  7)
         | (buf[3]      );
}

/**
 * `$xx xx xx xx`
 * @param {Buffer} buf
 * @returns {number} 
 */
export function parseUint32(buf) {
    return (buf[0] << 24)
         | (buf[1] << 16)
         | (buf[2] <<  8)
         | (buf[3]      );
}

/**
 * `$xx xx xx`
 * @param {number} x 
 * @returns {Buffer}
 */
export function uint24toBuffer(x) {
    return Buffer.from([
        (x >> 16) & 0xff,
        (x >>  8) & 0xff,
        (x      ) & 0xff,
    ]);
}

/**
 * 4 * `%0xxxxxxx`
 * @param {number} x 
 * @returns {Buffer}
 */
export function uint28toBuffer(x) {
    return Buffer.from([
        (x >> 21) & 0x7f,
        (x >> 14) & 0x7f,
        (x >>  7) & 0x7f,
        (x      ) & 0x7f,
    ]);
}

/**
 * `0x12345678` => `$12 34 56 78`
 * @param {number} x 
 * @returns {Buffer}
 */
export function uint32toBuffer(x) {
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(x);
    return buf;
}

/**
 * `0x12345678` => `$78 56 34 12`
 * @param {number} x 
 * @returns {Buffer}
 */
export function uint32toBufferR(x) {
    const buf = Buffer.alloc(4);
    buf.writeUInt32LE(x);
    return buf;
}

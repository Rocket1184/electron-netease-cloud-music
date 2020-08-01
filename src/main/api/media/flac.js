
// see https://xiph.org/flac/format.html

import { uint32toBuffer, getMIMEType, getJPEGSize, getPNGSize, getJPEGColorDepth, getPNGColorDepth } from "./utils";

const parseMetadataBlock = (buf) => {
    const isLast = Boolean(buf[0] & 0x80);
    const type = buf[0] & 0x7f;
    const length = parseMetadataSize(buf.slice(1, 4));
    const data = buf.slice(4, 4 + length);
    const result = {
        type,
        length,
        data,
        isLast
    };
    if (isLast) {
        return [result];
    } else {
        return [result, ...parseMetadataBlock(buf.slice(4 + length))];
    }
}

const parseMetadataSize = (buf) => {
    return buf[0] * 0x010000
         + buf[1] * 0x000100
         + buf[2] * 0x000001;
}

const metadata2buffer = (metadata) => {
    return Buffer.concat([
        Buffer.from([ (metadata.isLast ? 0x80 : 0) | metadata.type ]),
        length2buffer(metadata.length),
        metadata.data,
    ])
}

const length2buffer = (length) => {
    return Buffer.from([
        (length >> 16) & 0xff,
        (length >>  8) & 0xff,
        (length      ) & 0xff,
    ]);
}

/**
 * insert extra metadata to flac file
 * such as album cover
 */
export default class FLAC {

    static validate(buf) {
        // starts with fLaC
        return buf[0] === 0x66 && buf[1] === 0x4C &&
               buf[2] === 0x61 && buf[3] === 0x43;
    }

    constructor(buf) {
        this.header = buf.slice(0, 4);
        this.metadata = parseMetadataBlock(buf.slice(4));
        this.content = buf.slice(this.metadata.reduce((total, { length }) => {
            return total + length + 4;
        }, 4));
    }

    insertCover(cover) {
        const mime = getMIMEType(cover);
        if (mime === 'unknown') {
            return;
        }
        const size = mime === 'image/jpeg' ? getJPEGSize(cover) : getPNGSize(cover);
        const colorDepth = mime === 'image/jpeg' ? getJPEGColorDepth(cover) : getPNGColorDepth(cover);
        const data = Buffer.concat([
            // Cover (front)
            uint32toBuffer(3),
            // mime
            uint32toBuffer(mime.length),
            Buffer.from(mime),
            // description
            uint32toBuffer(0),
            // width
            uint32toBuffer(size.width),
            // height
            uint32toBuffer(size.height),
            // color depth
            uint32toBuffer(colorDepth),
            // color used for indexed-color ???
            uint32toBuffer(0),

            uint32toBuffer(cover.length),
            cover,
        ])
        this.metadata.push({
            type: 6,
            isLast: false,
            length: data.length,
            data,
        });
    }

    toBuffer() {
        const metadata = this.metadata.map((x, index) => {
            x.isLast = index === this.metadata.length - 1;
            return x;
        });
        return Buffer.concat([
            this.header,
            ...metadata.map(metadata2buffer),
            this.content,
        ]);
    }
}

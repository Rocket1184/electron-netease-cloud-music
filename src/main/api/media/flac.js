
// see https://xiph.org/flac/format.html

import { uint32toBuffer, uint32toBufferR, getMIMEType, getJPEGSize, getPNGSize, getJPEGColorDepth, getPNGColorDepth, uint24toBuffer, parseUint24 } from "./utils";

const parseMetadataBlock = (buf) => {
    const isLast = Boolean(buf[0] & 0x80);
    const type = buf[0] & 0x7f;
    const length = parseUint24(buf.slice(1, 4));
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

const metadata2buffer = (metadata) => {
    return Buffer.concat([
        Buffer.from([ (metadata.isLast ? 0x80 : 0) | metadata.type ]),
        uint24toBuffer(metadata.length),
        metadata.data,
    ]);
}

const encodeVorbisComment = (comments) => {
    const vendor = Buffer.from('Xiph.Org libVorbis I 20020717');
    const data = Buffer.concat([
        uint32toBufferR(vendor.length),
        vendor,
        uint32toBufferR(comments.length),
        ...comments.map((comment) => {
            const buf = Buffer.from(comment, 'utf8');
            return Buffer.concat([
                uint32toBufferR(buf.length),
                buf,
            ]);
        }),
    ]);

    return {
        type: 4,
        length: data.length,
        data,
        isLast: false,
    }
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
        this.header = buf.slice(0, 4); // always "fLaC"
        this.metadata = parseMetadataBlock(buf.slice(4));
        this.content = buf.slice(this.metadata.reduce((total, { length }) => {
            return total + length + 4;
        }, 4));
        this.comments = [];
    }

    addComment(name, text) {
        this.comments.push(`${name}=${text}`);
    }

    addTITLEcomment(text) {
        this.addComment('TITLE', text);
    }
    addARTISTcomment(text) {
        this.addComment('ARTIST', text);
    }
    addALBUMcomment(text) {
        this.addComment('ALBUM', text);
    }
    addTRACKNUMBERcomment(text) {
        this.addComment('TRACKNUMBER', text);
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
        this.metadata.push(encodeVorbisComment(this.comments));

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

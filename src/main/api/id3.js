
// see https://id3.org/id3v2.3.0

const parseHeaderLength = (buf) => {
    return buf[0] * (1 << 21)
         + buf[1] * (1 << 14)
         + buf[2] * (1 <<  7)
         + buf[3] * (1      );
}
const toHeaderLength = (x) => {
    return Buffer.from([
        (x >> 21) & 0x7f,
        (x >> 14) & 0x7f,
        (x >>  7) & 0x7f,
        (x      ) & 0x7f,
    ]);
}
const uint32toBuffer = (x) => {
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(x);
    return buf;
}
const tag2buffer = (tag) => {
    return Buffer.concat([
        Buffer.from(tag.tagname, 'ascii'),
        uint32toBuffer(tag.length),
        tag.flags,
        tag.data,
    ]);
}
const iso2buffer = (text) => {
    return Buffer.concat([
        Buffer.from(text, 'ascii'),
        Buffer.from([ 0x00 ]),
    ]);
}
const utf2buffer = (text) => {
    return Buffer.concat([
        Buffer.from([ 0xff, 0xfe ]),
        Buffer.from(text, 'utf-16le'),
        Buffer.from([ 0x00, 0x00 ]),
    ]);
}
const getMIMEType = (buf) => {
    if (buf[0] === 0x89 && buf[1] === 0x50 &&
        buf[2] === 0x4E && buf[3] === 0x47) {
        return 'image/png';
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
        return 'image/jpeg';
    }
    return 'unknown';
}

export default class ID3 {

    constructor(buf) {
        if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
            this.valid = true;
            this.header = buf.slice(0, 6);
            this.length = parseHeaderLength(buf.slice(6, 10));
            this.tags = [];
            this.content = buf.slice(10);
        } else {
            this.valid = false;
            this.content = buf;
        }
    }

    addTag(tagname, data) {
        this.tags.push({
            tagname,
            length: data.length,
            flags: Buffer.from([ 0x00, 0x00 ]),
            data
        });
    }

    addTextTag(tagname, text) {
        if (/^[\x20-\x7f]*$/.test(text)) {
            this.addTag(tagname, Buffer.concat([
                Buffer.from([ 0x00 ]),
                iso2buffer(text),
            ]))
        } else {
            this.addTag(tagname, Buffer.concat([
                Buffer.from([ 0x01 ]),
                utf2buffer(text),
            ]));
        }
    }

    addTIT2Tag(text) {
        this.addTextTag('TIT2', text);
    }
    addTCOMTag(text) {
        this.addTextTag('TCOM', text);
    }
    addTALBTag(text) {
        this.addTextTag('TALB', text);
    }

    addAPICTag(cover) {
        const mime = getMIMEType(cover);
        if (mime === 'unknown') {
            // invalid image
            return;
        }
        return this.addTag('APIC', Buffer.concat([
            // text encoding
            Buffer.from([ 0x00 ]),
            // MIME type: image/jpeg or image/png
            iso2buffer(mime),
            // picture type: Cover (front)
            Buffer.from([ 0x03 ]),
            // description: nothing
            iso2buffer(''),
            cover,
        ]));
    }

    toBuffer() {
        if (this.valid) {
            const tagbuf = Buffer.concat(this.tags.map(tag2buffer));
            return Buffer.concat([
                this.header,
                toHeaderLength(tagbuf.length + this.length),
                tagbuf,
                this.content,
            ]);
        } else {
            return this.content;
        }
    }
}

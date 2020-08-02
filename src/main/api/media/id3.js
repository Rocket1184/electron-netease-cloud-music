
import {
    getMIMEType,
    parseUint8,
    parseUint28,
    parseUint32,
    uint28toBuffer
} from './utils';

function getEncoding(text) {
    if (/^[\x20-\x7f]*$/.test(text)) {
        return Buffer.from([ 0x00 ]); // ISO-8859-1
    } else {
        return Buffer.from([ 0x03 ]); // utf8
    }
}

function text2buffer(text) {
    return Buffer.concat([
        Buffer.from(text, 'utf8'),
        Buffer.from([ 0x00 ]),
    ]);
}

/**
 * @typedef ID3Tag
 * @type {object}
 * @property {string} tagname
 * @property {number} length
 * @property {Buffer} flags
 * @property {Buffer} data
 */

/**
 * @param {number} version 
 * @param {Buffer} buf 
 * @returns {ID3Tag[]}
 */
function parseTag(version, buf) {
    if (!buf.length || buf[0] === 0x00) {
        // EOF or paddings
        return [];
    }
    const tagname = buf.slice(0, 4).toString();

    // difference btw v2.3 and v2.4
    const length = version === 3
        ? parseUint32(buf.slice(4, 8))
        : parseUint28(buf.slice(4, 8));

    const flags = buf.slice(8, 10);
    const data = buf.slice(10, 10 + length);

    return [{
        tagname,
        length,
        flags,
        data,
    }, ...parseTag(version, buf.slice(10 + length))];
}

/**
 * @param {ID3Tag} tag 
 * @returns {Buffer}
 */
function tag2buffer(tag) {
    return Buffer.concat([
        Buffer.from(tag.tagname),
        uint28toBuffer(tag.length),
        tag.flags,
        tag.data,
    ]);
}

/**
 * @see https://id3.org/id3v2.3.0
 * @see https://id3.org/id3v2.4.0-structure
 * 
 * Capable with both ID3v2.3 and ID3v2.4 standards,
 * but output with ID3v2.4 standards only.
 */
export default class ID3 {

    /**
     * Check if the given file is a ID3 file
     * @param {Buffer} buf 
     * @returns {boolean}
     */
    static validate(buf) {
        // starts with ID3
        return buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33 && (
            // and is ID3 v2.3 or v2.4
            buf[3] === 0x03 || buf[3] === 0x04
        );
    }

    /**
     * @param {Buffer} buf 
     */
    constructor(buf) {
        // 3 -> v2.3; 4 -> v2.4
        this.version = parseUint8(buf.slice(3, 4));
        this.length = parseUint28(buf.slice(6, 10));
        this.tags = parseTag(this.version, buf.slice(10, 10 + this.length));
        this.content = buf.slice(10 + this.length);
    }

    /**
     * Add a new tag
     * @param {string} tagname 
     * @param {Buffer} data 
     */
    addTag(tagname, data) {
        this.tags.push({
            tagname,
            length: data.length,
            flags: Buffer.from([ 0x00, 0x00 ]),
            data
        });
    }

    /**
     * Add a text tag (which tagname starts with `T`)
     * @param {string} tagname 
     * @param {string} text 
     */
    addTextTag(tagname, text) {
        this.addTag(tagname, Buffer.concat([
            getEncoding(text),
            text2buffer(text),
        ]));
    }

    /**
     * Add track title
     * @param {string} text 
     */
    addTIT2Tag(text) {
        this.addTextTag('TIT2', text);
    }

    /**
     * Add composer name(s)
     * @param {string} text 
     */
    addTCOMTag(text) {
        this.addTextTag('TCOM', text);
    }

    /**
     * Add album title
     * @param {string} text 
     */
    addTALBTag(text) {
        this.addTextTag('TALB', text);
    }

    /**
     * Add artist name(s)
     * @param {string} text 
     */
    addTPE1Tag(text) {
        this.addTextTag('TPE1', text);
    }

    /**
     * Add track number of the album
     * @param {number} no 
     */
    addTRCKTag(no) {
        this.addTextTag('TRCK', String(no));
    }

    /**
     * Attach a picture
     * @param {Buffer} cover 
     */
    addAPICTag(cover) {
        const mime = getMIMEType(cover);
        if (mime === 'unknown') {
            // invalid image
            return;
        }
        this.addTag('APIC', Buffer.concat([
            // text encoding
            getEncoding(mime),
            // MIME type: image/jpeg or image/png
            text2buffer(mime),
            // picture type: Cover (front)
            Buffer.from([ 0x03 ]),
            // description: nothing
            text2buffer(''),
            cover,
        ]));
    }

    /**
     * Output to buffer
     * @returns {Buffer}
     */
    toBuffer() {
        const tagbuf = Buffer.concat(this.tags.map(tag2buffer));
        return Buffer.concat([
            // convert whatever to ID3v2.4
            Buffer.from([ 0x49, 0x44, 0x33, 0x04, 0x00, 0x00 ]),
            uint28toBuffer(tagbuf.length),
            tagbuf,
            this.content,
        ]);
    }
}

import memoize from "lodash-es/memoize";
import { numberToByteArray, stringToByteArray, int16Bit, float32bit } from "./typedArrayUtils";
export class Value {
    constructor(bytes) {
        this.bytes = bytes;
    }
    write(buf, pos) {
        buf.set(this.bytes, pos);
        return pos + this.bytes.length;
    }
    countSize() {
        return this.bytes.length;
    }
}
export class Element {
    constructor(id, children, isSizeUnknown) {
        this.id = id;
        this.children = children;
        const bodySize = this.children.reduce((p, c) => p + c.countSize(), 0);
        this.sizeMetaData = isSizeUnknown ?
            UNKNOWN_SIZE :
            vintEncode(numberToByteArray(bodySize, getEBMLByteLength(bodySize)));
        this.size = this.id.length + this.sizeMetaData.length + bodySize;
    }
    write(buf, pos) {
        buf.set(this.id, pos);
        buf.set(this.sizeMetaData, pos + this.id.length);
        return this.children.reduce((p, c) => c.write(buf, p), pos + this.id.length + this.sizeMetaData.length);
    }
    countSize() {
        return this.size;
    }
}
export const bytes = memoize((data) => {
    return new Value(data);
});
export const number = memoize((num) => {
    return bytes(numberToByteArray(num));
});
export const vintEncodedNumber = memoize((num) => {
    return bytes(vintEncode(numberToByteArray(num, getEBMLByteLength(num))));
});
export const int16 = memoize((num) => {
    return bytes(int16Bit(num));
});
export const float = memoize((num) => {
    return bytes(float32bit(num));
});
export const string = memoize((str) => {
    return bytes(stringToByteArray(str));
});
export const element = (id, child) => {
    return new Element(id, Array.isArray(child) ? child : [child], false);
};
export const unknownSizeElement = (id, child) => {
    return new Element(id, Array.isArray(child) ? child : [child], true);
};
export const build = (v) => {
    const b = new Uint8Array(v.countSize());
    v.write(b, 0);
    return b;
};
export const getEBMLByteLength = (num) => {
    if (num < 0x7f) {
        return 1;
    }
    else if (num < 0x3fff) {
        return 2;
    }
    else if (num < 0x1fffff) {
        return 3;
    }
    else if (num < 0xfffffff) {
        return 4;
    }
    else if (num < 0x7ffffffff) {
        return 5;
    }
    else if (num < 0x3ffffffffff) {
        return 6;
    }
    else if (num < 0x1ffffffffffff) {
        return 7;
    }
    else if (num < 0x20000000000000) {
        return 8;
    }
    else if (num < 0xffffffffffffff) {
        throw new Error("EBMLgetEBMLByteLength: number exceeds Number.MAX_SAFE_INTEGER");
    }
    else {
        throw new Error("EBMLgetEBMLByteLength: data size must be less than or equal to " + (Math.pow(2, 56) - 2));
    }
};
export const UNKNOWN_SIZE = new Uint8Array([0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
export const vintEncode = (byteArray) => {
    byteArray[0] = getSizeMask(byteArray.length) | byteArray[0];
    return byteArray;
};
export const getSizeMask = (byteLength) => {
    return 0x80 >> (byteLength - 1);
};

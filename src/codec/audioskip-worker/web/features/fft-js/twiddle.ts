export function countTrailingZeros(v: number) {
    let c = 32;
    v &= -v;
    if (v) c--;
    if (v & 0x0000FFFF) c -= 16;
    if (v & 0x00FF00FF) c -= 8;
    if (v & 0x0F0F0F0F) c -= 4;
    if (v & 0x33333333) c -= 2;
    if (v & 0x55555555) c -= 1;
    return c;
}

export const INT_BITS = 32;

export const REVERSE_TABLE = new Uint8Array(256);
for (var i = 0; i < 256; ++i) {
    var v = i, r = i, s = 7;
    for (v >>>= 1; v; v >>>= 1) {
        r <<= 1;
        r |= v & 1;
        --s;
    }
    REVERSE_TABLE[i] = (r << s) & 0xff;
}

export function reverse(v: number) {
    return (REVERSE_TABLE[v & 0xff] << 24) |
        (REVERSE_TABLE[(v >>> 8) & 0xff] << 16) |
        (REVERSE_TABLE[(v >>> 16) & 0xff] << 8) |
        REVERSE_TABLE[(v >>> 24) & 0xff];
}

const MSB = 0x80
    , REST = 0x7F
    , MSBALL = ~REST
    , INT = Math.pow(2, 31)

export function encode(num: number, out?: Buffer, offset: number = 0): Buffer {
    out = out || Buffer.from(``)
    offset = offset || 0
    const oldOffset = offset
    while (num >= INT) {
        out[offset++] = (num & 0xFF) | MSB
        num /= 128
    }
    while (num & MSBALL) {
        out[offset++] = (num & 0xFF) | MSB
        num >>>= 7
    }
    out[offset] = num | 0;
    (out as any).bytes = offset - oldOffset + 1;
    return out
}

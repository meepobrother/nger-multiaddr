const MSB = 0x80
    , REST = 0x7F

export function decode(buf: Buffer, offset: number = 0): number {
    let res: number = 0;
    let shift: number = 0;
    let counter: number = offset;
    let b: number;
    let l: number = buf.length;
    offset = offset || 0
    do {
        if (counter >= l) {
            (decode as any).bytes = 0
            throw new RangeError('Could not decode varint')
        }
        b = buf[counter++]
        res += shift < 28
            ? (b & REST) << shift
            : (b & REST) * Math.pow(2, shift)
        shift += 7
    } while (b >= MSB)
    (decode as any).bytes = counter - offset
    return res
}
import { encodingLength } from './encodingLength';
import { encode } from './encode';
import { decode } from './decode';
export class VarInt {
    encode(num: number, out?: Buffer, offset: number = 0): Buffer {
        return encode(num, out, offset)
    }
    decode(buf: Buffer, offset: number = 0): number {
        return decode(buf, offset)
    }
    encodingLength(val: number): number {
        return encodingLength(val)
    }
    bufferEncode(input: Buffer): Buffer {
        return new Buffer(this.encode(this.bufferToNumber(input)))
    }
    bufferDecode(input: Buffer): Buffer {
        return this.numberToBuffer(this.decode(input))
    }
    private bufferToNumber(buf: Buffer): number {
        return parseInt(buf.toString('hex'), 16)
    }
    private numberToBuffer(num: number): Buffer {
        let hexString = num.toString(16)
        if (hexString.length % 2 === 1) {
            hexString = '0' + hexString
        }
        return new Buffer(hexString, 'hex')
    }
}

export const varInt = new VarInt()

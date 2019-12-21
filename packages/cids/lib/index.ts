const CID = require('cids');
import { Codec } from './codec';
import { Multibase } from './multibase'
export class Cid {
    codec: Codec;
    version: 0 | 1;
    multihash: Buffer;
    multibaseName: Multibase;
    buffer: Buffer;
    prefix: Buffer;
    private readonly _cid: any;
    constructor(buf: Buffer);
    constructor(baseEncodedString: string);
    constructor(version: 0 | 1, codec: Codec, multihash: Buffer, multibaseName?: Multibase);
    constructor(...args: any[]) {
        this._cid = new CID(...args)
        this.codec = this._cid.codec;
        this.version = this._cid.version;
        this.multihash = this._cid.multihash;
        this.multibaseName = this._cid.multibaseName;
        this.buffer = this._cid.buffer;
        this.prefix = this._cid.prefix;
    }
    toV0(): Cid {
        return this._cid.toV0();
    }
    toV1(): Cid {
        return this._cid.toV1();
    }
    toBaseEncodedString(base?: Multibase): string {
        return this._cid.toBaseEncodedString(base)
    }
    toString(base?: Multibase): string {
        return this._cid.toString(base)
    }
    equals(cid: Cid) {
        return this._cid.equals(cid._cid)
    }
}

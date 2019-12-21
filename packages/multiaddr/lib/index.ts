const multiaddr = require(`multiaddr`);
import { Protos, ProtoCode } from './protos'
export interface MultiaddrProto {
    code: ProtoCode;
    size: number;
    name: Protos;
    path: boolean;
    resolvable: boolean;
}
export interface MultiaddrOptions {
    family: string;
    host: string;
    port: number;
    transport: string;
}
export class Multiaddr {
    private _addr: any;

    buffer: Buffer;
    constructor(addr: string) {
        this._addr = multiaddr(addr)
        this.buffer = this._addr.buffer;
    }
    toString(): string {
        return this._addr.toString();
    }
    protos(): MultiaddrProto[] {
        return this._addr.protos();
    }
    toJSON(): string {
        return this._addr.toJSON();
    }
    toOptions(): MultiaddrOptions {
        return this._addr.toOptions();
    }
    inspect(): string {
        return this._addr.inspect();
    }
    protoCodes(): ProtoCode[] {
        return this._addr.protoCodes();
    }
    protoNames(): Protos[] {
        return this._addr.protoNames();
    }
    tuples(): [number, Buffer][] {
        return this._addr.tuples();
    }
    stringTuples(): [number, string][] {
        return this._addr.stringTuples();
    }
    encapsulate(addr: Multiaddr): Multiaddr {
        return this._addr.encapsulate(addr);
    }
    decapsulate(addr: Multiaddr) {
        return this._addr.decapsulate(addr);
    }
    decapsulateCode(code: ProtoCode) {
        return this._addr.decapsulateCode(code);
    }
    getPeerId(): string | null {
        return this._addr.getPeerId();
    }
    getPath(): string | null {
        return this._addr.getPath();
    }
    equals(addr: Multiaddr): boolean {
        return this._addr.equals(addr._addr)
    }
    nodeAddress() {
        return this._addr.nodeAddress();
    }
}


const addr = new Multiaddr(`/ip4/127.0.0.1/udp/1234/tcp/2345/sctp/8080`)
const addrString = addr.toString();
const protos = addr.protos();
const toJson = addr.toJSON();
const toOptions = addr.toOptions();
const inspect = addr.inspect();
const protoCodes = addr.protoCodes();
const tuples = addr.tuples();
const addr2 = new Multiaddr(`/ip4/127.0.0.2/udp/2234`)
const encapsulate = addr.encapsulate(addr2)
const decapsulateCode = addr2.decapsulateCode(421).inspect()
const getPath = addr2.getPath();
const getPeerId = addr2.getPeerId();
const nodeAddress = addr2.nodeAddress();
debugger;
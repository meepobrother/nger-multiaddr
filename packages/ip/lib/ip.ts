import { networkInterfaces } from 'os';
const ipv4Regex = /^(\d{1,3}\.){3,3}\d{1,3}$/;
const ipv6Regex = /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i;
export type FamilyType = `ipv4` | `ipv6` | "IPv4" | "IPv6"
export class Ip {
    toBuffer(ip: string, buff?: Buffer, offset: number = 0): Buffer {
        offset = ~~offset;
        let result!: Buffer;
        if (this.isV4Format(ip)) {
            result = buff || new Buffer(offset + 4);
            ip.split(/\./g).map(function (byte) {
                result[offset++] = parseInt(byte, 10) & 0xff;
            });
        } else if (this.isV6Format(ip)) {
            const sections = ip.split(':', 8);
            let i: number;
            for (i = 0; i < sections.length; i++) {
                const isv4 = this.isV4Format(sections[i]);
                let v4Buffer!: Buffer;
                if (isv4) {
                    v4Buffer = this.toBuffer(sections[i]);
                    sections[i] = v4Buffer.slice(0, 2).toString('hex');
                }
                if (v4Buffer && ++i < 8) {
                    sections.splice(i, 0, v4Buffer.slice(2, 4).toString('hex'));
                }
            }
            if (sections[0] === '') {
                while (sections.length < 8) sections.unshift('0');
            } else if (sections[sections.length - 1] === '') {
                while (sections.length < 8) sections.push('0');
            } else if (sections.length < 8) {
                for (i = 0; i < sections.length && sections[i] !== ''; i++);
                const argv: any[] = [i, 1];
                for (i = 9 - sections.length; i > 0; i--) {
                    argv.push('0');
                }
                sections.splice.apply(sections, argv as any);
            }
            result = buff || new Buffer(offset + 16);
            for (i = 0; i < sections.length; i++) {
                var word = parseInt(sections[i], 16);
                result[offset++] = (word >> 8) & 0xff;
                result[offset++] = word & 0xff;
            }
        }
        if (!result) {
            throw Error('Invalid ip address: ' + ip);
        }
        return result;
    }
    toString(buff: Buffer, offset: number = 0, length: number = 0): string {
        offset = ~~offset;
        length = length || (buff.length - offset);
        let result: any = [];
        if (length === 4) {
            // IPv4
            for (let i = 0; i < length; i++) {
                result.push(buff[offset + i]);
            }
            result = result.join('.');
        } else if (length === 16) {
            // IPv6
            for (let i = 0; i < length; i += 2) {
                result.push(buff.readUInt16BE(offset + i).toString(16));
            }
            result = result.join(':');
            result = result.replace(/(^|:)0(:0)*:0(:|$)/, '$1::$3');
            result = result.replace(/:{3,4}/, '::');
        }
        return result;
    }
    fromPrefixLen(prefixlen: number, family?: string): string {
        if (prefixlen > 32) {
            family = 'ipv6';
        } else {
            family = this._normalizeFamily(family);
        }
        let len = 4;
        if (family === 'ipv6') {
            len = 16;
        }
        let buff = new Buffer(len);
        for (let i = 0, n = buff.length; i < n; ++i) {
            let bits = 8;
            if (prefixlen < 8) {
                bits = prefixlen;
            }
            prefixlen -= bits;
            buff[i] = ~(0xff >> bits) & 0xff;
        }
        return this.toString(buff);
    }
    isV4Format(ip: string): boolean {
        return ipv4Regex.test(ip);
    }
    isV6Format(ip: string): boolean {
        return ipv6Regex.test(ip);
    }
    isPrivate(addr: string): boolean {
        return /^(::f{4}:)?10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i
            .test(addr) ||
            /^(::f{4}:)?192\.168\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
            /^(::f{4}:)?172\.(1[6-9]|2\d|30|31)\.([0-9]{1,3})\.([0-9]{1,3})$/i
                .test(addr) ||
            /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
            /^(::f{4}:)?169\.254\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
            /^f[cd][0-9a-f]{2}:/i.test(addr) ||
            /^fe80:/i.test(addr) ||
            /^::1$/.test(addr) ||
            /^::$/.test(addr);
    }
    isPublic(addr: string): boolean {
        return !this.isPrivate(addr)
    }
    isLoopback(addr: string) {
        return /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/
            .test(addr) ||
            /^fe80::1$/.test(addr) ||
            /^::1$/.test(addr) ||
            /^::$/.test(addr);
    }
    loopback(family: string): string {
        family = this._normalizeFamily(family);
        if (family !== 'ipv4' && family !== 'ipv6') {
            throw new Error('family must be ipv4 or ipv6');
        }
        return family === 'ipv4' ? '127.0.0.1' : 'fe80::1';
    }
    toLong(ip: string): number {
        var ipl = 0;
        ip.split('.').forEach(function (octet) {
            ipl <<= 8;
            ipl += parseInt(octet);
        });
        return (ipl >>> 0);
    };
    fromLong(ipl: number): string {
        return ((ipl >>> 24) + '.' +
            (ipl >> 16 & 255) + '.' +
            (ipl >> 8 & 255) + '.' +
            (ipl & 255));
    }
    mask(_addr: string, _mask: string): string {
        const addr = this.toBuffer(_addr);
        const mask = this.toBuffer(_mask);
        const result = new Buffer(Math.max(addr.length, mask.length));
        let i: number = 0;
        // Same protocol - do bitwise and
        if (addr.length === mask.length) {
            for (i = 0; i < addr.length; i++) {
                result[i] = addr[i] & mask[i];
            }
        } else if (mask.length === 4) {
            // IPv6 address and IPv4 mask
            // (Mask low bits)
            for (i = 0; i < mask.length; i++) {
                result[i] = addr[addr.length - 4 + i] & mask[i];
            }
        } else {
            // IPv6 mask and IPv4 addr
            for (i = 0; i < result.length - 6; i++) {
                result[i] = 0;
            }
            // ::ffff:ipv4
            result[10] = 0xff;
            result[11] = 0xff;
            for (i = 0; i < addr.length; i++) {
                result[i + 12] = addr[i] & mask[i + 12];
            }
            i = i + 12;
        }
        for (; i < result.length; i++)
            result[i] = 0;
        return this.toString(result);
    }
    cidr(cidrString: string) {
        var cidrParts = cidrString.split('/');
        var addr = cidrParts[0];
        if (cidrParts.length !== 2)
            throw new Error('invalid CIDR subnet: ' + addr);
        var mask = this.fromPrefixLen(parseInt(cidrParts[1], 10));
        return this.mask(addr, mask);
    }
    subnet(addr: string, mask: string) {
        const networkAddress = this.toLong(this.mask(addr, mask));
        // Calculate the mask's length.
        const maskBuffer = this.toBuffer(mask);
        let maskLength: number = 0;
        for (let i = 0; i < maskBuffer.length; i++) {
            if (maskBuffer[i] === 0xff) {
                maskLength += 8;
            } else {
                var octet = maskBuffer[i] & 0xff;
                while (octet) {
                    octet = (octet << 1) & 0xff;
                    maskLength++;
                }
            }
        }
        var numberOfAddresses = Math.pow(2, 32 - maskLength);
        return {
            networkAddress: this.fromLong(networkAddress),
            firstAddress: numberOfAddresses <= 2 ?
                this.fromLong(networkAddress) :
                this.fromLong(networkAddress + 1),
            lastAddress: numberOfAddresses <= 2 ?
                this.fromLong(networkAddress + numberOfAddresses - 1) :
                this.fromLong(networkAddress + numberOfAddresses - 2),
            broadcastAddress: this.fromLong(networkAddress + numberOfAddresses - 1),
            subnetMask: mask,
            subnetMaskLength: maskLength,
            numHosts: numberOfAddresses <= 2 ?
                numberOfAddresses : numberOfAddresses - 2,
            length: numberOfAddresses,
            contains: (other: string) => {
                return networkAddress === this.toLong(this.mask(other, mask));
            }
        };
    }
    cidrSubnet(cidrString: string) {
        const cidrParts = cidrString.split('/');
        const addr = cidrParts[0];
        if (cidrParts.length !== 2)
            throw new Error('invalid CIDR subnet: ' + addr);
        const mask = this.fromPrefixLen(parseInt(cidrParts[1], 10));
        return this.subnet(addr, mask);
    }
    not(addr: string) {
        const buff = this.toBuffer(addr);
        for (let i = 0; i < buff.length; i++) {
            buff[i] = 0xff ^ buff[i];
        }
        return this.toString(buff);
    }
    or(_a: string, _b: string) {
        const a = this.toBuffer(_a);
        const b = this.toBuffer(_b);
        // same protocol
        if (a.length === b.length) {
            for (var i = 0; i < a.length; ++i) {
                a[i] |= b[i];
            }
            return this.toString(a);
            // mixed protocols
        } else {
            let buff = a;
            let other = b;
            if (b.length > a.length) {
                buff = b;
                other = a;
            }
            const offset = buff.length - other.length;
            for (let i = offset; i < buff.length; ++i) {
                buff[i] |= other[i - offset];
            }
            return this.toString(buff);
        }
    }
    isEqual(_a: string, _b: string): boolean {
        let a = this.toBuffer(_a);
        let b = this.toBuffer(_b);
        // Same protocol
        if (a.length === b.length) {
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        }
        // Swap
        if (b.length === 4) {
            const t = b;
            b = a;
            a = t;
        }
        // a - IPv4, b - IPv6
        for (let i = 0; i < 10; i++) {
            if (b[i] !== 0) return false;
        }
        const word = b.readUInt16BE(10);
        if (word !== 0 && word !== 0xffff) return false;
        for (let i = 0; i < 4; i++) {
            if (a[i] !== b[i + 12]) return false;
        }
        return true;
    }
    address(name: 'private' | 'public' | string = 'public', family?: FamilyType): string | undefined {
        const interfaces = networkInterfaces();
        family = this._normalizeFamily(family);
        if (name && name !== 'private' && name !== 'public') {
            const res = interfaces[name].filter((details) => {
                const itemFamily = details.family.toLowerCase();
                return itemFamily === family;
            });
            if (res.length === 0)
                return undefined;
            return res[0].address;
        }
        const all = Object.keys(interfaces).map((nic) => {
            let addresses = interfaces[nic].filter((details) => {
                (details as any).family = details.family.toLowerCase();
                if (details.family !== family || this.isLoopback(details.address)) {
                    return false;
                } else if (!name) {
                    return true;
                }
                return name === 'public' ? this.isPrivate(details.address) :
                    this.isPublic(details.address);
            });
            return addresses.length ? addresses[0].address : undefined;
        }).filter(Boolean);
        return !all.length ? this.loopback(family) : all[0];
    }
    private _normalizeFamily(family?: string): FamilyType {
        return family ? family.toLowerCase() as FamilyType : 'ipv4';
    }
}
export const ip = new Ip();
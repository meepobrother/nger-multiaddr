export type Protos =
    'ip4' | 'tcp' | 'udp' |
    'dccp' | 'ip6' | 'ip6zone' |
    'dns' | 'dns' | 'dns6' |
    'dnsaddr' | 'sctp' | 'udt' |
    'utp' | 'unix' | 'p2p' | 'ipfs' |
    'onion' | 'onion3' | 'garlic64' |
    'garlic32' | 'quic' | 'http' |
    'https' | 'ws' | 'wss' |
    'p2p-websocket-star' | 'p2p-stardust' |
    'p2p-webrtc-star' | 'p2p-webrtc-direct' |
    'p2p-circuit' | 'memory';
export type ProtoCode = 4 | 6 | 273 | 33 | 41 |
    42 | 53 | 54 | 55 | 56 | 132 | 132 | 302 | 400 | 421 | 444 | 445
    | 446 | 447 | 460 | 480 | 443 | 477 | 478 | 479 | 277 | 277 | 276 | 290 | 777;
import * as ed25519 from '@noble/ed25519';

/**
 * Convert BigInteger to byte array
 * @param {bigint} n - bigint value
 * @returns {Promise<number[]>} byte array
 */
export const big_int_to_byte_array = async (n: bigint): Promise<number[]> => {
    // we want to represent the input as a 32-byte array
    const a: number[] = [0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < a.length; ++i) {
        const b = n & BigInt(0xff);
        a [i] = Number(b);
        n = (n - b) / 256n ;
    }
    return a;
};

/**
 * Convert Uint8Array to BigInteger
 * @param {Uint8Array} a - byte array
 * @returns {Promise<bigint>} big integer converted from array
 */
export const byte_array_to_big_int = async (a: Uint8Array): Promise<bigint> => {
    let value = 0n;
    for (let i = a.length - 1; i >= 0; --i) {
        value = (value * 256n) + BigInt(a[i]);
    }
    return value;
};

/**
 * Make a valid scalar
 * @param {Uint8Array} v - bytes to reduce
 * @returns {Promise<string>} hex string reduced mod l
 */
export const sc_reduce_32 = async (v: Uint8Array): Promise<string> => {
    const m = ed25519.utils.mod(
        await byte_array_to_big_int(v), ed25519.CURVE.l
    );
    return ed25519.utils.bytesToHex(
        new Uint8Array(await big_int_to_byte_array(m))
    );
}

/**
 * Generic Monero keys: (private / public, spend / view keys, etc)
 */
export interface Keys {
    /**
     * Secret spend key
     */
    ssk: string;
    /**
     * Secret view key
     */
    svk: string;
    /**
     * Public spend key
     */
    psk: string;
    /**
     * Public view key
     */
    pvk: string
}

/**
 * Monero network bytes as defined in:
 * https://github.com/monero-project/monero/blob/master/src/cryptonote_config.h
 */
export enum NetworkByte {
    MAINNET = '12',
    STAGENET = '18',
    TESTNET = '35'
}

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
        n = (n - b) / BigInt(256) ;
    }
    return a;
};

/**
 * Convert Uint8Array to BigInteger
 * @param {Uint8Array} a - byte array
 * @returns {Promise<bigint>} big integer converted from array
 */
export const byte_array_to_big_int = async (a: Uint8Array): Promise<bigint> => {
    let value = BigInt(0);
    for (let i = a.length - 1; i >= 0; --i) {
        value = value * BigInt(256) + BigInt(a[i]);
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
 * Scalars check for `0 -> (l - 1)`
 * @param {bigint} v - possible scalar value
 * @returns overflowed scalar or within bounds value
 */
export const l_overflow_check = async (v: bigint): Promise<bigint> => {
    if (v > ed25519.CURVE.l) {
        return v - ed25519.CURVE.l;
    }
    if (v < BigInt("0")) {
        return ed25519.CURVE.l - (v * BigInt("-1"));
    }
    return v;
}

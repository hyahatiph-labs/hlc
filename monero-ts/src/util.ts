/**
 * Convert BigInteger to byte array
 * @param n - bigint value
 * @returns byte array
 */
export const bn2byteArray = async (n: bigint): Promise<number[]> => {
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
 * @param a - byte array
 * @returns 
 */
export const array2bn = async (a: Uint8Array): Promise<bigint> => {
    let value = 0n;
    for (let i = a.length - 1; i >= 0; --i) {
        value = (value * 256n) + BigInt(a[i]);
    }
    return value;
};

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
}

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

/**
 * Create a Scalar
 * @param {bigint} n - big integer 
 * @returns scalar
 */
export class Scalar {

    /**
     * hex represenation of the scalar
     */
    private hex_value: Promise<string>;
    private value: Promise<bigint>;

    constructor (n: bigint) {
        this.hex_value = this.set_hex_value(n);
        this.value = this.set_value(n);
    }

    /**
     * Set the hex string of a valid scalar
     * @param {bigint} n - big integer value
     */
    private set_hex_value = async (n: bigint): Promise<string> => {
        const m = ed25519.utils.mod(n, ed25519.CURVE.l);
        const check_m = await l_overflow_check(m)
        return ed25519.utils.bytesToHex(
            new Uint8Array(await big_int_to_byte_array(check_m))
        );
    }

    /**
     * Set the big int of a valid scalar
     * @param {bigint} n - big integer value
     */
     private set_value = async (n: bigint): Promise<bigint> => {
        const m = ed25519.utils.mod(n, ed25519.CURVE.l);
        return l_overflow_check(m);
    }

    /**
     * Get the hex string of a valid scalar 
     */
    public get_hex_value = (): Promise<string> => this.hex_value;

    /**
     * Get the big integer value of a valid scalar 
     */
     public get_value = (): Promise<bigint> => this.value;

    /**
     * Sum scalar
     * @param {string} v - value to sum
     * @returns sum
     */
    public add = async (v: string): Promise<bigint> => {
        const x = await byte_array_to_big_int(Buffer.from(await v, 'hex'));
        return l_overflow_check(await this.value + x);
    }

    /**
     * Subtract scalar
     * @param {string} v - value to subtract
     * @returns difference
     */
    public subtract = async (v: string): Promise<bigint> => {
        const x = await byte_array_to_big_int(Buffer.from(await v, 'hex'));
        return l_overflow_check(await this.value - x);
    }

    /**
     * Multiply scalar
     * @param {string} v - value to multiply
     * @returns product
     */
    public multiply = async (v: string): Promise<bigint> => {
        const x = await byte_array_to_big_int(Buffer.from(await v, 'hex'));
        return l_overflow_check(await this.value * x);
    }

    /**
     * Divide scalar
     * @param {string} v - value to dive
     * @returns ` x * 1/x`
     */
    public divide = async (v: Promise<string>): Promise<bigint> => {
        const x = await byte_array_to_big_int(Buffer.from(await v, 'hex'));
        const inv = ed25519.utils.invert(x, ed25519.CURVE.l);
        const quot = await l_overflow_check(await this.value * inv);
        return l_overflow_check(x * quot);
    }

    /**
     * Power of scalar
     * @param {string} v - value to power
     * @returns exponential scalar
     */
    public exp = async (v: string): Promise<bigint> => {
        const n = await byte_array_to_big_int(Buffer.from(await v, 'hex'));
        return l_overflow_check((await this.value) ** n);
    }
}


/**
 * Generate a random Scalar instances
 * @returns {Scalar} random 32-byte Scalar
 */
export const rnd_scalar = async (): Promise<Scalar> => {
    const bytes = new Uint8Array(ed25519.utils.randomBytes(32));
    return new Scalar(await byte_array_to_big_int(bytes));
}

// TODO: ScalarVector class

// TODO: PointVector class
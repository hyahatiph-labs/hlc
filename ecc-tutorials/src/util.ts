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

  constructor(n: bigint) {
    this.hex_value = this.set_hex_value(n);
    this.value = this.set_value(n);
  }

  /**
   * Set the hex string of a valid scalar
   * @param {bigint} n - big integer value
   * @returns {Promise<string>}
   */
  private set_hex_value = async (n: bigint): Promise<string> => {
    const m = ed25519.utils.mod(n, ed25519.CURVE.l);
    const check_m = await l_overflow_check(m);
    return ed25519.utils.bytesToHex(
      new Uint8Array(await big_int_to_byte_array(check_m))
    );
  };

  /**
   * Set the big int of a valid scalar
   * @param {bigint} n - big integer value
   */
  private set_value = async (n: bigint): Promise<bigint> => {
    const m = ed25519.utils.mod(n, ed25519.CURVE.l);
    return l_overflow_check(m);
  };

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
   * @returns {Promise<Scalar>}
   */
  public add = async (v: string): Promise<Scalar> => {
    const x = await byte_array_to_big_int(Buffer.from(await v, "hex"));
    return new Scalar(await l_overflow_check((await this.value) + x));
  };

  /**
   * Subtract scalar
   * @param {string} v - value to subtract
   * @returns {Promise<Scalar>}
   */
  public subtract = async (v: string): Promise<Scalar> => {
    const x = await byte_array_to_big_int(Buffer.from(await v, "hex"));
    return new Scalar(await l_overflow_check((await this.value) - x));
  };

  /**
   * Multiply scalar
   * @param {string} v - value to multiply
   * @returns {Promise<Scalar>}
   */
  public multiply = async (v: string): Promise<Scalar> => {
    const x = await byte_array_to_big_int(Buffer.from(await v, "hex"));
    return new Scalar(await l_overflow_check((await this.value) * x));
  };

  /**
   * Something like division for Scalars
   * @param {string} v - value to divide
   * @returns {Promise<Scalar>} ` x * 1/x`
   */
  public divide = async (v: string): Promise<Scalar> => {
    const x = await byte_array_to_big_int(Buffer.from(await v, "hex"));
    const inv = ed25519.utils.invert(x, ed25519.CURVE.l);
    const quot = await l_overflow_check((await this.value) * inv);
    return new Scalar(await l_overflow_check(x * quot));
  };

  /**
   * Power of scalar
   * @param {string} v - value to power
   * @returns {Promise<Scalar>} exponential scalar
   */
  public exp = async (v: string): Promise<Scalar> => {
    const n = await byte_array_to_big_int(Buffer.from(await v, "hex"));
    return new Scalar(await l_overflow_check((await this.value) ** n));
  };
}

/**
 * Generate a random Scalar instances
 * @returns {Promise<Scalar>} random 32-byte Scalar
 */
export const rnd_scalar = async (): Promise<Scalar> => {
  const bytes = new Uint8Array(ed25519.utils.randomBytes(32));
  return new Scalar(await byte_array_to_big_int(bytes));
};

/**
 * Create a Point Vector
 * @param {string[]} n - big integer (as hex string) array
 * @returns scalar vector
 */
 export class PointVector {

  private value: Promise<ed25519.Point[]>;

  constructor(s: string[]) {
    this.value = this.set_value(s);
  }

  /**
   * Set the points of a valid point vector
   * @param {string[]} sv - scalar array
   */
  private set_value = async (sv: string[]): Promise<ed25519.Point[]> => {
    const r: ed25519.Point[] = [];
    sv.forEach(async (s, i) => (r[i] = ed25519.Point.fromHex(s)));
    return r;
  };

  /**
   * Get the points of a valid scalar vector
   */
  public get_value = (): Promise<ed25519.Point[]> => this.value;

  /**
   * Sum point vector
   * @param {PointVector} pv - point vector to sum
   * @returns {Promise<PointVector>}
   */
  public add = async (pv: PointVector): Promise<PointVector> => {
    const self = await this.get_value();
    const value = await pv.get_value();
    const r: string[] = [];
    if (await this.is_valid_length(self, value)) {
      for (let i = 0; i < value.length; ++i) {
        r[i] = self[i].add(value[i]).toHex();
      }
    }
    return new PointVector(r);
  };

  /**
   * Subtract point vector
   * @param {PointVector} sv - point vector to sum
   * @returns {Promise<PointVector>}
   */
  public subtract = async (sv: PointVector): Promise<PointVector> => {
    const self = await this.get_value();
    const value = await sv.get_value();
    const r: string[] = [];
    if (await this.is_valid_length(self, value)) {
      for (let i = 0; i < value.length; ++i) {
        r[i] = self[i].subtract(value[i]).toHex();
      }
    }
    return new PointVector(r);
  };

  /**
   * Multiply point vector by scalar vector or scalar
   * @param {ScalarVector | Scalar} sv - scalar vector or scalar to multiply
   * @returns {Promise<PointVector>}
   */
  public multiply = async (sv: ScalarVector | Scalar): Promise<PointVector> => {
    const self = await this.get_value();
    const sv_value: Scalar[] = sv instanceof ScalarVector ? await sv.get_value() : null;
    const s_value: Scalar = sv instanceof Scalar ? sv : null;
    const r: string[] = [];
    if (sv_value && (await this.is_valid_length(self, sv_value))) {
      // PointVector - ScalarVector: Hadamard Product 
      for (let i = 0; i < sv_value.length; ++i) {
        r[i] = self[i].multiply(await sv_value[i].get_value()).toHex();
      }
    }
    if (s_value) {
      for (let i = 0; i < self.length; ++i) {
        r[i] = self[i].multiply(await s_value.get_value()).toHex();
      }
    }
    return new PointVector(r);
  };

  /**
   * Negate the values in this point vector
   * @returns {Promise<PointVector>}
   */
  public negate = async (): Promise<PointVector> => {
      const ba: string[] = [];
      (
        await this.get_value()).forEach(
          async p => ba.push(p.negate().toHex())
      )
      return new PointVector(ba);
  }

  /**
   * PointVector ** ScalarVector: Dot product
   * @param sv scalar vector
   * @returns {Promise<Scalar>} scalar
   */
  public pow = async (sv: ScalarVector): Promise<Scalar> => {
    if (await this.is_valid_length(await this.get_value(), await sv.get_value())) {
      return this.multiexp(sv);
    }
  }

  /**
   * Multiscalar multiplication
   * TODO: DEBUG
   * @param sv scalar vector
   * @returns {Promise<ed25519.Point>}
   */
  private multiexp = async (sv: ScalarVector): Promise<Scalar> => {
    if (await this.is_valid_length(await this.get_value(), await sv.get_value())) {
      if (await (await sv.get_value()).length === 0)
        return new Scalar(ed25519.Point.ZERO.y);
      let buckets: ed25519.Point[] = [];
      let result: Scalar = new Scalar(ed25519.Point.ZERO.y);
      const c = BigInt("4");
      // super hacky javascript reduce/accumulator logic for getting max scalar from vector
      const maxscalar = await (await sv.get_value())
        .reduce((a,b) => a.get_value() > b.get_value() ? a : b);
      let groups = BigInt("0");
      while (await maxscalar.get_value() >= BigInt("2")**groups)
        groups += BigInt("1")
      groups = groups + BigInt(groups + BigInt(c - BigInt("1"))) / BigInt(c);
      for (let k = groups - BigInt("1"); k >= BigInt("-1"); --k) {
        if (result !== new Scalar(ed25519.Point.ZERO.y)) {
          for (let i = 0; i <= c; ++i)
            result.add(await result.get_hex_value());
        }
        // clear all buckets
        buckets = [
          ed25519.Point.fromHex(
            ed25519.utils.bytesToHex(
              new Uint8Array(
                await big_int_to_byte_array(ed25519.Point.ZERO.y*(BigInt("2")**c))
              )
            )
          )
        ]
        // partition scalars into buckets
        for (let i = 0; i <= (await sv.get_value()).length; ++i) {
          let bucket = 0;
          for (let j = 0; j <= c; ++j) {
            const sa: Scalar[] = await sv.get_value();
            if (await sa[i].get_value() & (BigInt("1") << BigInt(k)*c*BigInt(j)))
              bucket |= 1 << j;
          }
          if (bucket === 0) continue; // zero bucket is never used
          const pa = await this.get_value();
          if (buckets[bucket] !== ed25519.Point.ZERO)
            buckets[bucket].add(pa[i]);
          else
            buckets[bucket] = pa[i];
        }
        // sum all of the buckets
        let pail = ed25519.Point.ZERO;
        for (let i = buckets.length - 1; i >= 0; --i) {
          if (buckets[i] !== ed25519.Point.ZERO) pail = pail.add(buckets[i]);
          if (pail !== ed25519.Point.ZERO) result = await result.add(pail.toHex())
        }
      }
    return result; 
    }
  }

  private is_valid_length = async (
    self: ed25519.Point[],
    v: ed25519.Point[] | Scalar[]): Promise<boolean> => {
    if (v.length !== self.length) {
      throw new Error("Point vectors must be the same length.");
    }
    return true;
  };

}

/**
 * Create a Scalar Vector
 * @param {bigint[]} n - big integer array
 * @returns scalar vector
 */
export class ScalarVector {

  private value: Promise<Scalar[]>;

  constructor(v: bigint[]) {
    this.value = this.set_value(v);
  }

  /**
   * Set the big int of a valid scalar vector
   * @param {Promise<Scalar[]>} v - big integer array value
   */
  private set_value = async (v: bigint[]): Promise<Scalar[]> => {
    const r: Scalar[] = [];
    v.forEach((p, i) => (r[i] = new Scalar(p)));
    return r;
  };

  /**
   * Get the big integer values of a valid scalar vector
   */
  public get_value = (): Promise<Scalar[]> => this.value;

  /**
   * Sum scalar vector
   * @param {ScalarVector} sv - scalar vector to sum
   * @returns {Promise<ScalarVector>}
   */
  public add = async (sv: ScalarVector): Promise<ScalarVector> => {
    const self = await this.get_value();
    const value = await sv.get_value();
    const r: bigint[] = [];
    if (await this.is_valid_length(value)) {
      for (let i = 0; i < value.length; ++i) {
        r[i] = await (await value[i].add(await self[i].get_hex_value())).get_value();
      }
    }
    return new ScalarVector(r);
  };

  /**
   * Subtract scalar vector
   * @param {ScalarVector} sv - scalar vector to sum
   * @returns {Promise<ScalarVector>}
   */
  public subtract = async (sv: ScalarVector): Promise<ScalarVector> => {
    const self = await this.get_value();
    const value = await sv.get_value();
    const r: bigint[] = [];
    if (await this.is_valid_length(value)) {
      for (let i = 0; i < value.length; ++i) {
        r[i] = await (await value[i].subtract(await self[i].get_hex_value())).get_value();
      }
    }
    return new ScalarVector(r);
  };

  /**
   * Multiply scalar vector by vector or scalar
   * @param {ScalarVector | Scalar} sv - scalar vector to multiply
   * @returns {Promise<ScalarVector>}
   */
  public multiply = async (sv: ScalarVector | Scalar): Promise<ScalarVector> => {
    const self = await this.get_value();
    const sv_value: Scalar[] = sv instanceof ScalarVector ? await sv.get_value() : null;
    const s_value: Scalar = sv instanceof Scalar ? sv : null;
    const r: bigint[] = [];
    if (sv_value && (await this.is_valid_length(sv_value))) {
      // Hadamard Product
      for (let i = 0; i < sv_value.length; ++i) {
        r[i] = await (await sv_value[i].multiply(await self[i].get_hex_value())).get_value();
      }
    }
    if (s_value) {
      for (let i = 0; i < self.length; ++i) {
        r[i] = await (await self[i].multiply(await s_value.get_hex_value())).get_value();
      }
    }
    return new ScalarVector(r);
  };

  /**
   * Something like division for Scalar Vectors
   * @param {ScalarVector} sv - scalar vector to divide
   * @returns {Promise<ScalarVector>} ` x * 1/x`
   */
  public divide = async (sv: ScalarVector): Promise<ScalarVector> => {
    const self = await this.get_value();
    const value = await sv.get_value();
    const r: bigint[] = [];
    if (await this.is_valid_length(value)) {
      for (let i = 0; i < value.length; ++i) {
        r[i] = await (await value[i].divide(await self[i].get_hex_value())).get_value();
      }
    }
    return new ScalarVector(r);
  };

  /**
   * Reduce this scalar vector to scalar of sum of all scalars in the vector
   * @returns {Promise<Scalar>}
   */
  public sum_of_all = async (): Promise<Scalar> => {
      const ba: bigint[] = [];
      await (await this.get_value()).forEach(async s => ba.push(await s.get_value()));
      return new Scalar(ba.reduce((a, b) => a + b));
  };

  /**
   * Negate the values in this scalar vector
   * @returns {Promise<ScalarVector>}
   */
  public negate = async (): Promise<ScalarVector> => {
      const ba: bigint[] = [];
      await (await this.get_value())
        .forEach(async s => ba.push(await s.get_value() * BigInt("-1"))
      )
      return new ScalarVector(ba);
  }

  /**
   * Multiscalar multiplication
   * @param {PointVector} v - point vector
   * @returns {Promise<Scalar>} scalar
   */
  public pow = async (v: ScalarVector | PointVector): Promise<Scalar> => {
    const sv_value: Scalar[] = v instanceof ScalarVector 
      ? await v.get_value() : null;
    const pv_value: ed25519.Point[] = v instanceof PointVector 
      ? await v.get_value() : null;
    // ScalarVector**ScalarVector: inner product
    let r: Scalar = new Scalar(BigInt("0"));
    if (sv_value && await this.is_valid_length(sv_value)) {
      const n = await this.get_value();
      for (let i = 0; i < sv_value.length; ++i) {
        const m = n[i].multiply(await sv_value[i].get_hex_value());
        const hex = await (await m).get_hex_value();
        r = await r.add(hex);
      }
      return r;
    }
    if (pv_value) { return v.pow(this); }
  }

  private is_valid_length = async (v: Scalar[]): Promise<boolean> => {
    if (v.length !== await (await this.get_value()).length) {
      throw new Error("Vectors must be the same length.");
    }
    return true;
  };

}

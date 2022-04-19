/*
    # The reference Ed25519 software is in the public domain.
    #     Source: https://ed25519.cr.yp.to/python/ed25519.py
    #     Date accessed: 2 Nov. 2016
    #
    # Additions and changes made to the original sources are released as specified
    # in 'LICENSE' document distributed with this software.
*/

// the fastest typescript edwards curve library
import * as ed from '@noble/ed25519';
// for keecak 256 hashing (view key, etc.)
import keccak from 'keccak';

/**
 * Convert BigInteger to byte array
 * @param n - bigint value
 * @returns byte array
 */
const bn2byteArray = (n: bigint): number[] => {
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
const array2bn = (a: Uint8Array): bigint => {
    let value = 0n;
    for (let i = a.length - 1; i >= 0; i--) {
        value = (value * 256n) + BigInt(a[i]);
    }
    return value;
};

const seed = 'e1d956975a1bef763f309850268aacc176a229c8f4c9a187ca0b9f0ada40a02d';
const modulo = ed.utils.mod(ed.Point.fromHex(seed).y, ed.CURVE.l);
const ssk = ed.utils.bytesToHex(new Uint8Array(bn2byteArray(modulo)));
const svki = array2bn(new Uint8Array(keccak('keccak256').update(ssk).digest()));
const modulo2 = ed.utils.mod(svki, ed.CURVE.l);
const svk = ed.utils.bytesToHex(new Uint8Array(bn2byteArray(modulo2)));
console.log(`secret spend key: ${ssk}`)
console.log(`secret view key: ${svk}`)

/*
    # The reference Ed25519 software is in the public domain.
    #     Source: https://ed25519.cr.yp.to/python/ed25519.py
    #     Date accessed: 04/19/2022
    #
    # Additions and changes made to the original sources are released as specified
    # in 'LICENSE' document distributed with this software.
*/

import keccak from 'keccak';
import * as Config from './config';
import * as Utilities from './util';
import {base58xmr} from '@scure/base';
import * as ed25519 from '@noble/ed25519';

/**
 * Generate Monero private and public keys
 * @returns {Utilities.Keys} - Monero keys
 */
export const generate_keys = async (): Promise<Utilities.Keys> => {
    const seed = new Uint8Array(ed25519.utils.randomBytes(Config.KEY_SIZE));
    const ssk = await Utilities.sc_reduce_32(seed);
    const hash = new Uint8Array(keccak(Config.KECCAK_256).update(ssk).digest());
    const svk = await Utilities.sc_reduce_32(hash);
    const psk = ed25519.utils.bytesToHex(ed25519.curve25519.scalarMultBase(ssk));
    const pvk = ed25519.utils.bytesToHex(ed25519.curve25519.scalarMultBase(svk));
    return { ssk, svk, psk, pvk };
}

/**
 * Generate a standard monero address
 * @param nb {Utilities.NetworkByte} - network byte
 * @param keys {Utilities.Keys} - monero keys
 * @returns {string} - standard address
 */
export const generate_standard_address = async (
    nb: Utilities.NetworkByte, keys: Utilities.Keys): Promise<string> => {
    const data = `${nb}${keys.psk}${keys.pvk}`;
    const aHash = keccak(Config.KECCAK_256)
        .update(Buffer.from(data, Config.HEX)).digest(Config.HEX);
    const checksum = aHash.slice(0, 8);
    return base58xmr.encode(Buffer.from(`${data}${checksum}`, Config.HEX));
}

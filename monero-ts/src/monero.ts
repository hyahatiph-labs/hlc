/*
    # The reference Ed25519 software is in the public domain.
    #     Source: https://ed25519.cr.yp.to/python/ed25519.py
    #     Date accessed: 04/19/2022
    #
    # Additions and changes made to the original sources are released as specified
    # in 'LICENSE' document distributed with this software.
*/

import * as ed25519 from '@noble/ed25519';
import * as Utilities from './util';
import * as Config from './config';
import keccak from 'keccak';

/**
 * Generate Monero private and public keys
 * @returns {Utilities.Keys} - Monero keys
 */
export const generate_keys = async (): Promise<Utilities.Keys> => {
    const seed = new Uint8Array(ed25519.utils.randomBytes(Config.KEY_SIZE));
    const ssk = await Utilities.sc_reduce_32(seed);
    const hash = new Uint8Array(keccak(Config.KECCAK_256).update(ssk).digest());
    const svk = await Utilities.sc_reduce_32(hash);
    const psk = "TODO: public spend key";
    const pvk = "TODO: public view key";
    return { ssk, svk, psk, pvk };
}

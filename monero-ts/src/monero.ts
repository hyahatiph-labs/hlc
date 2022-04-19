/*
    # The reference Ed25519 software is in the public domain.
    #     Source: https://ed25519.cr.yp.to/python/ed25519.py
    #     Date accessed: 04/19/2022
    #
    # Additions and changes made to the original sources are released as specified
    # in 'LICENSE' document distributed with this software.
*/

import * as ed from '@noble/ed25519';
import * as Logging from './logging';
import * as Utilities from './util';
import * as Config from './config';
import keccak from 'keccak';

/**
 * Generate Monero private and public keys
 * @returns {Utilities.Keys} - Monero keys
 */
export const keys = async (): Promise<Utilities.Keys> => {
    const seed = ed.utils.randomBytes(Config.KEY_SIZE);
    const modulo = ed.utils.mod(ed.Point.fromHex(seed).y, ed.CURVE.l);
    const ssk = ed.utils.bytesToHex(new Uint8Array(Utilities.bn2byteArray(modulo)));
    const svki = Utilities.array2bn(new Uint8Array(keccak(Config.KECCAK_256).update(ssk).digest()));
    const modulo2 = ed.utils.mod(svki, ed.CURVE.l);
    const svk = ed.utils.bytesToHex(new Uint8Array(Utilities.bn2byteArray(modulo2)));
    const keys: Utilities.Keys = { ssk, svk };
    Logging.log(`generated keys: ${JSON.stringify(keys)}`, Logging.LogLevel.DEBUG);
    return keys;
}

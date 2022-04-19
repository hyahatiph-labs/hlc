/*
    # The reference Ed25519 software is in the public domain.
    #     Source: https://ed25519.cr.yp.to/python/ed25519.py
    #     Date accessed: 04/19/2022
    #
    # Additions and changes made to the original sources are released as specified
    # in 'LICENSE' document distributed with this software.
*/

import * as ed25519 from '@noble/ed25519';
import * as Logging from './logging';
import * as Utilities from './util';
import * as Config from './config';
import keccak from 'keccak';

/**
 * Generate Monero private and public keys
 * @returns {Utilities.Keys} - Monero keys
 */
export const generateKeys = async (): Promise<Utilities.Keys> => {
    try {
        const seed = ed25519.utils.bytesToHex(ed25519.utils.randomBytes(Config.KEY_SIZE));
        const sski = ed25519.Point.fromHex(seed).y;
        const modulo = ed25519.utils.mod(sski, ed25519.CURVE.l);
        const ssk = ed25519.utils.bytesToHex(
            new Uint8Array(await Utilities.bn2byteArray(modulo))
        );
        const svki = await Utilities.array2bn(
            new Uint8Array(keccak(Config.KECCAK_256).update(ssk).digest())
        );
        const modulo2 = ed25519.utils.mod(svki, ed25519.CURVE.l);
        const svk = ed25519.utils.bytesToHex(
            new Uint8Array(await Utilities.bn2byteArray(modulo2))
        );
        return { ssk, svk };
    } catch (e) { // if at first you don't succeed...
        Logging.log(`${e}`, Logging.LogLevel.ERROR);
        return generateKeys();
    }
}

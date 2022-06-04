### Exercise: what is (-1)G + G?

```typescript
const result = async (): Promise<void> => {
    const minus1 = await (await one.subtract(two_val)).get_value();
    const answer = ed25519.Point.BASE.multiply(minus1).add(ed25519.Point.BASE);
    console.log(`(-1)G + G = ${answer.toHex()}`);
}
result();
```

### Exercise: what is (1/x)*(xG)?

```typescript
const result = async (): Promise<void> => {
    const x = await (await Utils.rnd_scalar()).get_value();
    const invX = ed25519.utils.invert(x, ed25519.CURVE.l);
    const xG = ed25519.Point.BASE.multiply(x);
    console.log(`(1/x) * (xG) = ${xG.multiply(invX).toHex()}`);
}
result();
```

### Exercise: is Z == Z + random_point()?

```typescript
const random_point = async (): Promise<ed25519.Point> => {
    let point;
    try {
        point = ed25519.Point.fromHex(await (await Utils.rnd_scalar()).get_hex_value())
    } catch {
        point = await random_point();
    }
    return point;
}
const result = async (): Promise<void> => {
    const Z = ed25519.Point.ZERO;
    const rp = await random_point();
    console.log(`random_point: ${rp.toHex()}`);
    console.log(`${Z.toHex()} == ${Z.add(rp).toHex()}`);
    console.log(Z.equals(Z.add(rp)))
    console.log(`random_point() + Z == random_point: ${rp.equals(Z.add(rp))}`);
}
result();
```

### Exercise: the Diffie-Hellman (DH) key exchange

```typescript
// Reference Zero to Monero p.16

// simple example
const dhEasy = async (): Promise<void> => {
    // generate Alice and Bob's Private and Public keys
    const G = ed25519.Point.BASE.y // base generator
    const P = ed25519.CURVE.P      // CURVE.P
    const pvKeyA = await Utils.rnd_scalar();
    const pvKeyB = await Utils.rnd_scalar();
    const pubKeyA = ed25519.utils.mod(G * (await pvKeyA.get_value()), P);
    const pubKeyB = ed25519.utils.mod(G * (await pvKeyB.get_value()), P);
    // generate shared secret (pubKey * pvKey mod n)
    const sA = ed25519.utils.mod(pubKeyB * (await pvKeyA.get_value()), P);
    const sB = ed25519.utils.mod(pubKeyA * (await pvKeyB.get_value()), P);
    console.log(`Alice shared secret: ${sA}`);
    console.log(`Bob shared secret: ${sB}`)
}
dhEasy();

// more realistic example
const dh = async (): Promise<void> => {
// generate Alice and Bob's Private and Public keys
const pvKeyA = ed25519.utils.randomPrivateKey();
const pvKeyB = ed25519.utils.randomPrivateKey();
const pubKeyA = ed25519.utils.bytesToHex(await ed25519.getPublicKey(pvKeyA));
const pubKeyB = ed25519.utils.bytesToHex(await ed25519.getPublicKey(pvKeyB));
console.log(`Bob sends public key: ${pubKeyB}`);
const sA = ed25519.utils.bytesToHex(await ed25519.getSharedSecret(pvKeyA, pubKeyB));
console.log(`Alice sends public key: ${pubKeyA}`);
const sB = ed25519.utils.bytesToHex(await ed25519.getSharedSecret(pvKeyB, pubKeyA));
console.log(`Alice shared secret: ${sA}`);
console.log(`Bob shared secret: ${sB}`)
const message = "himitsudayo";
// Alice calculates h = H(S), sending x to Bob where (x = m + h)
const h = await Utils.hash_to_scalar([sA]);
const mA = await Utils.hash_to_scalar([message]);
console.log(`message: ${await mA.get_hex_value()}`);
const x = await mA.add(await h.get_value());
console.log(`Alice sent x: ${await x.get_hex_value()}`);
// Bob uses x to calculate m via (m = x - h')
const hPrime = await Utils.hash_to_scalar([sB]);
const mB = await x.subtract(await hPrime.get_value());
console.log(`Bob docded x to m: ${await mB.get_hex_value()}`);
}
dh();
```

### Pedersen Commitments

```typescript
const x1 = BigInt('42'); // amount 1
const x2 = BigInt('69'); // amount 2
const H = await Utils.hash_to_point(["pedersen"]);
const G = ed25519.Point.BASE.y; // (generator point)
interface Pair {
    r: bigint;
    rGxH: bigint;
}
const pedersen = async (x: bigint): Promise<Pair> => {
    // secret blinding factor
    const r = await (await Utils.rnd_scalar()).get_value();
    const rG = r * G;               // tx public key
    const xH = x * H.y;             // amount * cofactor
    const rGxH = rG + xH;           // this goes to blockchain
    const pair: Pair = {r, rGxH};   // function output
    return pair;
}
const rPedersen = async (): Promise<void> => {
    const p1: Pair = await pedersen(x1);
    const p2: Pair = await pedersen(x2);
    const c1 = p1.rGxH + p2.rGxH;                       // commit 1
    const c2 = ((p1.r + p2.r) * G) + ((x1 + x2) * H.y); // commit 2
    console.log(`pedersen(x1) + pedersen(x2) = ${c1}`);
    console.log(`(r1 + r2)G + (x1 + x2)H = ${c2}`);
    console.log(`commit1 === commit2: ${c1 === c2}`);   // test for homomorphicity
}
rPedersen();
```

### Exercise: implement Elgamal point encryption scheme.

```typescript
const G = ed25519.Point.BASE            // base generator
const rB = await Utils.rnd_scalar();    // Bob's private key
const x = await rB.get_value();
const P = G.multiply(x);                // Bob's public key
const expected = BigInt("69420");       // expected value
const P1 = BigInt("420");               // partial value
const P2 = expected - BigInt("420");    // remaining value
const H = await Utils.hash_to_point(["pedersen"]);
interface EncOut {
    rG: ed25519.Point;
    YrP: ed25519.Point;
}
/**
 * Alice's encryption for `(rG, Y + rP)`
 * @param {ed25519.Point} Y pair (C1, C2)
 * @param {ed25519.Point} P Bob's public key
 * @returns {Promise<ed25519.Point}
 */
const enc = async (Y: ed25519.Point, P: ed25519.Point): Promise<EncOut> => {
    const rA = await Utils.rnd_scalar();
    const r = await rA.get_value();
    const rG = G.multiply(r);
    const YrP = Y.add(P.multiply(r));
    return { rG, YrP }; // (C1, C2)
}
/**
 * Bob's decryption for `Y = C2 - x * C1`
 * @param {EncOut} e pair (C1, C2)
 * @returns {Promise<ed25519.Point} decrypted point
 */
const dec = async (e: EncOut): Promise<ed25519.Point> => {
    return e.YrP.subtract(e.rG.multiply(x));
}
// execute the scheme and validate
const elgamal = async (): Promise<void> => {
    // Encrypts partial values and sum
    const e1 = await enc(H.multiply(P1), P);
    const e2 = await enc(H.multiply(P2), P);
    const sum: EncOut = {
        rG: e1.rG.add(e2.rG),   // (P1C1+P2C1)
        YrP: e1.YrP.add(e2.YrP) // (P1C2+P2C2)
    }
    // Decrypt the sum
    const d = await dec(sum);   // (SC1, SC2)
    console.log(`expected: 69420 * H = ${H.multiply(expected).toHex()}`);
    console.log(`actual: ${d.toHex()}`);
}
elgamal();
```

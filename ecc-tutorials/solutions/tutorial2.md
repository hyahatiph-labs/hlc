# Shamir's Secret Sharing

#### preparation

```typescript
const coeff0  = await actual_secret.get_value();
const rs1     = await Utils.rnd_scalar();
const coeff1  = await rs1.get_value();
const rs2     = await Utils.rnd_scalar();
const coeff2  = await rs2.get_value();
const poly_a  = [coeff0, coeff1, coeff2];
const poly    = new Utils.ScalarVector(poly_a);  

const poly_eval = async (x: Utils.Scalar, coeff: Utils.ScalarVector): Promise<Utils.Scalar> => {
  const powers_x: bigint[] = [];
  powers_x.push(BigInt("1"));
  const clen = (await (await coeff).get_value()).length
  for (let i = 0; i < clen - 1; ++i)
          powers_x.push((await x.get_value()) * powers_x[i]);
  const sv1 = new Utils.ScalarVector(powers_x);
  return await sv1.pow(coeff);
}

// player list
const players_a: bigint[] = [];
interface Coord {
  x: Utils.Scalar;
  y: Utils.Scalar;
}
const all_coords: Coord[] = [];
for (let i = BigInt("1"); i <= BigInt("5"); ++i)
  players_a.push(i); 
const plsv = new Utils.ScalarVector(players_a);
const player_list = await plsv.get_value();
player_list.forEach(async p => {
  const e = await poly_eval(p, poly);
  const c: Coord = {x:p, y:e};
  all_coords.push(c);
})
```

#### recovery

```typescript
const recovery_coord: Coord[] = [all_coords[1], all_coords[3], all_coords[4]];
const recovery = async (c: Coord[]): Promise<Utils.Scalar> => {
    const l: Utils.Scalar[] = [];
    // we only need to calculate the free coeffecient, fc
    for (let i = 0; i < c.length; ++i) {
        const ia    = i == 0 ? 1 : 0;
        const ib    = i == c.length - 1 ? 1 : c.length - 1;
        const fc_n  = await c[ia].x.multiply(await c[ib].x.get_value());
        const fc_da = await c[i].x.subtract(await c[ia].x.get_value());
        const fc_db = await c[i].x.subtract(await c[ib].x.get_value());
        const fc_d  = await fc_da.multiply(await fc_db.get_value());
        const fc    = await fc_n.divide(await fc_d.get_value());
        l.push(fc);
    }
    let ss = new Utils.Scalar(BigInt("0"));
    for (let j = 0; j < l.length; ++j) {
        const ly = await c[j].y.multiply(await l[j].get_value());
        ss = await ss.add(await ly.get_value()); 
    }
    return ss;
}
const recovered_secret = await recovery(recovery_coord);
const actual = await actual_secret.get_value();
const recovered = await recovered_secret.get_value();
if (actual === recovered) {
  console.log(`Shamir's Secret Sharing implementation recovered ${actual} successfully`)
}
```
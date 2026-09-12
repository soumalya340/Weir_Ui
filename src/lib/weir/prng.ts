export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function walkPrices(end: number, n: number, seed: number, vol: number) {
  const rand = mulberry32(seed);
  const out = Array<number>(n);
  out[n - 1] = end;
  for (let i = n - 2; i >= 0; i--) {
    const shock = (rand() - 0.47) * vol;
    out[i] = Math.max(end * 0.12, out[i + 1] * (1 - shock));
  }
  return out;
}

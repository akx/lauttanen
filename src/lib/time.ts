export function hmsToDaySeconds(h: number, m: number, s: number): number {
  return h * 60 * 60 + m * 60 + s;
}

export function hmsStringToTriple(hmsString: string): [number, number, number] {
  const [h, m, s] = hmsString.split(":").map((bit) => parseInt(bit, 10));
  return [h, m, s];
}

export function hmsStringToDaySeconds(hmsString: string): number {
  const [h, m, s] = hmsStringToTriple(hmsString);
  return hmsToDaySeconds(h, m, s);
}

export function dateToDaySeconds(date: Date): number {
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  return hmsToDaySeconds(h, m, s);
}

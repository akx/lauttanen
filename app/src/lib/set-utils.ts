export function union<T>(...sets: Set<T>[]): Set<T> {
  const sOut = new Set<T>();
  sets.forEach((set) => set.forEach((v) => sOut.add(v)));
  return sOut;
}

export function intersect<T>(set1: Set<T>, ...sets: Set<T>[]): Set<T> {
  const sOut = new Set<T>(set1);
  sets.forEach((set) => set.forEach((v) => sOut.delete(v)));
  return sOut;
}

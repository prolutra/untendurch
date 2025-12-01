import { compareI18n } from './compare';

declare global {
  interface Array<T> {
    groupBy<K>(this: T[], keyGetter: (input: T) => K): Map<K, T[]>;

    sortedI18n<T>(
      this: T[],
      propertyAccessFn?: (x: T, y: T) => [string, string]
    ): T[];

    sortI18n<T>(
      this: T[],
      propertyAccessFn?: (x: T, y: T) => [string, string]
    ): T[];
  }
}

Array.prototype.sortI18n = function <T>(
  this: T[],
  propertyAccessFn?: (a: T, b: T) => [string, string]
): T[] {
  return this.sort((a, b) => {
    const [as, bs] = propertyAccessFn
      ? propertyAccessFn(a, b)
      : ['' + a, '' + b];

    return compareI18n(as, bs);
  });
};

Array.prototype.groupBy = function <K, V>(
  this: V[],
  keyGetter: (input: V) => K
): Map<K, V[]> {
  const map = new Map<K, V[]>();
  this.forEach((item: V) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
};

Array.prototype.sortedI18n = function <T>(
  this: T[],
  propertyAccessFn?: (a: T, b: T) => [string, string]
): T[] {
  const cloned: T[] = [];
  this.forEach((val) => cloned.push(val));
  return cloned.sortI18n(propertyAccessFn);
};

export function compareI18n(a: string, b: string): number {
  return new Intl.Collator([], { numeric: true }).compare(a, b);
}

export function compareBoolean(
  a: boolean,
  b: boolean,
  whenEqual: () => number
): number {
  if (a && !b) {
    return -1;
  } else if (!a && b) {
    return 1;
  } else {
    return whenEqual();
  }
}

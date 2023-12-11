import type { IdentityResult } from './IdentityResult';

export interface IdentityResultEntries<T> extends IdentityResult {
  properties: T | undefined;
  attributes: T | undefined;
}

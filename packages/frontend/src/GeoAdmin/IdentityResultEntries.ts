import type { IdentityResult } from './IdentityResult';

export interface IdentityResultEntries<T> extends IdentityResult {
  attributes: T | undefined;
  properties: T | undefined;
}

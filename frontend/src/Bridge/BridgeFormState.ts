import type { BridgeLogItem } from '../Store/BridgeSchema';

export type PersistedFile = { name: string; url: string };
export type BridgeFormState = {
  objectId: string | undefined;
  name: string;
  shape: string;
  hasBanquet: boolean;
  hasMinimalBanquetWidth: boolean;
  hasStones: boolean;
  bridgeWidth: number;
  bridgeHeight: number;
  bridgeLength: number;
  hasContinuousShore: boolean;
  hasSlopes: boolean;
  traffic: string;
  speedLimit: string;
  barriers: string;
  nickname: string;
  email: string;
  commentReporter: string;
  commentAdmin: string | undefined;
  images: (File | PersistedFile)[];
  cantons: string;
  municipalities: string;
  itemLog: BridgeLogItem[] | undefined;
};

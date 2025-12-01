import type { BridgeLogItem } from '../Store/BridgeSchema';

export type BridgeFormState = {
  barriers: string;
  bridgeHeight: number;
  bridgeLength: number;
  bridgeWidth: number;
  cantons: string;
  commentAdmin: string | undefined;
  commentReporter: string;
  email: string;
  hasBanquet: boolean;
  hasContinuousShore: boolean;
  hasMinimalBanquetWidth: boolean;
  hasSlopes: boolean;
  hasStones: boolean;
  images: Parse.File[];
  imagesToDelete?: Parse.File[];
  imagesToUpload?: { isNew: boolean; name: string; url: string }[];
  itemLog: BridgeLogItem[] | undefined;
  municipalities: string;
  name: string;
  nickname: string;
  objectId: string | undefined;
  shape: string;
  speedLimit: string;
  traffic: string;
};
export type PersistedFile = { name: string; url: string };

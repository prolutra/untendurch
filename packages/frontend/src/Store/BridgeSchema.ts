import type { GeoPoint } from 'parse';

import type { BridgeStatus } from './BridgeStatus';

export type BridgeLogItem = {
  date: string;
  message: string;
  type: 'error' | 'info' | 'warning';
};

export interface BridgeSchema {
  barriers: string;
  bridgeHeight: number;
  bridgeIndex: null;
  bridgeLength: number;
  bridgeWidth: number;
  cantons: string[];
  createdAt: string;
  hasBanquet: boolean;
  hasContinuousShore: boolean;
  hasSlopes: boolean;
  hasStones: boolean;
  images: [{ name: string; url: string }];
  isManualOverride: boolean;
  itemLog?: BridgeLogItem[];
  municipalities: string[];
  name: string;
  nickname: string;
  objectId: string;
  otterFriendly: string;
  position: GeoPoint;
  safetyRisk: string;
  shape: string;
  speedLimit: string;
  status: BridgeStatus;
  traffic: string;
  updatedAt: string;
  waterBodies: string[];
}

export const BridgeSchemaFields: (keyof BridgeSchema)[] = [
  'objectId',
  'position',
  'waterBodies',
  'name',
  'shape',
  'hasBanquet',
  'hasStones',
  'bridgeWidth',
  'bridgeHeight',
  'bridgeLength',
  'hasContinuousShore',
  'hasSlopes',
  'traffic',
  'speedLimit',
  'barriers',
  'nickname',
  'bridgeIndex',
  'otterFriendly',
  'safetyRisk',
  'images',
  'isManualOverride',
  'createdAt',
  'updatedAt',
  'cantons',
  'municipalities',
  'status',
];

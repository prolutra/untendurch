import type { GeoPoint } from 'parse';
import type { BridgeStatus } from './BridgeStatus';

export type BridgeLogItem = {
  date: string;
  message: string;
  type: 'info' | 'warning' | 'error';
};

export interface BridgeSchema {
  objectId: string;
  position: GeoPoint;
  waterBodies: string[];
  name: string;
  shape: string;
  hasBanquet: boolean;
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
  bridgeIndex: null;
  otterFriendly: string;
  safetyRisk: string;
  images: [{ name: string; url: string }];
  isManualOverride: boolean;
  createdAt: string;
  updatedAt: string;
  cantons: string[];
  municipalities: string[];
  status: BridgeStatus;
  itemLog?: BridgeLogItem[];
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

import type { BridgeStatus } from './BridgeStatus';
import type { LatLon } from './LatLon';
import type { SafetyRisk } from './SafetyRisk';

export interface BridgePin {
  averageDailyTraffic: number | undefined;
  bridgeIndex: number;
  cantons: string[];
  imageUrl: string;
  latLon: LatLon;
  municipalities: string[];
  name: string;
  nickname: string;
  objectId: string;
  otterFriendly: string;
  safetyRisk: SafetyRisk | undefined;
  shape: string;
  status: BridgeStatus;
}

export function createBridgePin(data: {
  averageDailyTraffic?: number;
  bridgeIndex: number;
  cantons: string[];
  imageUrl: string;
  latLon: LatLon;
  municipalities: string[];
  name: string;
  nickname: string;
  objectId: string;
  otterFriendly: string;
  safetyRisk?: SafetyRisk;
  shape: string;
  status: BridgeStatus;
}): BridgePin {
  return {
    averageDailyTraffic: data.averageDailyTraffic,
    bridgeIndex: data.bridgeIndex,
    cantons: data.cantons,
    imageUrl: data.imageUrl,
    latLon: data.latLon,
    municipalities: data.municipalities,
    name: data.name,
    nickname: data.nickname,
    objectId: data.objectId,
    otterFriendly: data.otterFriendly,
    safetyRisk: data.safetyRisk,
    shape: data.shape,
    status: data.status,
  };
}

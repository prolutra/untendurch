import { model, Model, prop } from 'mobx-keystone';

import type { LatLon } from './LatLon';
import type { SafetyRisk } from './SafetyRisk';

@model('untendurch/BridgePin')
export class BridgePin extends Model({
  averageDailyTraffic: prop<number | undefined>(() => undefined),
  bridgeIndex: prop<number>(),
  cantons: prop<string[]>(() => []),
  imageUrl: prop<string>(),
  latLon: prop<LatLon>(),
  municipalities: prop<string[]>(() => []),
  name: prop<string>(),
  nickname: prop<string>(),
  objectId: prop<string>(),
  otterFriendly: prop<string>(),
  safetyRisk: prop<SafetyRisk | undefined>(() => undefined),
  shape: prop<string>(),
  status: prop<string>(),
}) {}

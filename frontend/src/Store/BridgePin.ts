import { model, Model, prop } from 'mobx-keystone';
import { LatLon } from './LatLon';
import { SafetyRisk } from './SafetyRisk';

@model('untendurch/BridgePin')
export class BridgePin extends Model({
  latLon: prop<LatLon>(),
  objectId: prop<string>(),
  name: prop<string>(),
  safetyRisk: prop<SafetyRisk | undefined>(() => undefined),
  cantons: prop<string[]>(() => []),
  municipalities: prop<string[]>(() => []),
  status: prop<string>(),
  bridgeIndex: prop<number>(),
  otterFriendly: prop<string>(),
  imageUrl: prop<string>(),
  nickname: prop<string>(),
  shape: prop<string>(),
  averageDailyTraffic: prop<number | undefined>(() => undefined),
}) {}

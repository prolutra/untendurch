import { model, Model, prop } from 'mobx-keystone';
import { AllFilter } from './AllFilter';

export type MapMode = 'FULL' | 'TOP' | 'NONE';

@model('untendurch/Map')
export class MapStore extends Model({
  containerClassName: prop<string>(() => '').withSetter(),
  className: prop<string>(() => 'ol-map').withSetter(),
  zoom: prop<number>(() => 9).withSetter(),
  center: prop<number[]>(() => [
    916355.3315324377, 5909283.341607826,
  ]).withSetter(),
  mode: prop<MapMode>(() => 'FULL').withSetter(),
  filterCanton: prop<string>(() => AllFilter).withSetter(),
  filterMunicipality: prop<string>(() => AllFilter).withSetter(),
  filterStatus: prop<string>(() => AllFilter).withSetter(),
  filterOtterFriendly: prop<string>(() => AllFilter).withSetter(),
  filterSafetyRisk: prop<string>(() => AllFilter).withSetter(),
  selectedBridgePinObjectId: prop<string | null>(() => null).withSetter(),
}) {}

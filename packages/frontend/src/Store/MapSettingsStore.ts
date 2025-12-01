import { model, Model, prop } from 'mobx-keystone';

import { AllFilter } from './AllFilter';

export type MapMode = 'FULL' | 'NONE' | 'TOP';

@model('untendurch/Map')
export class MapStore extends Model({
  center: prop<number[]>(() => [
    916355.3315324377, 5909283.341607826,
  ]).withSetter(),
  className: prop<string>(() => 'ol-map').withSetter(),
  containerClassName: prop<string>(() => '').withSetter(),
  filterCanton: prop<string>(() => AllFilter).withSetter(),
  filterMunicipality: prop<string>(() => AllFilter).withSetter(),
  filterOtterFriendly: prop<string>(() => AllFilter).withSetter(),
  filterSafetyRisk: prop<string>(() => AllFilter).withSetter(),
  filterStatus: prop<string>(() => AllFilter).withSetter(),
  mode: prop<MapMode>(() => 'FULL').withSetter(),
  selectedBridgePinObjectId: prop<null | string>(() => null).withSetter(),
  zoom: prop<number>(() => 9).withSetter(),
}) {}

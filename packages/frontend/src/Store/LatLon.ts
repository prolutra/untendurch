import { computed } from 'mobx';
import { model, Model, prop } from 'mobx-keystone';

import type { Lv95 } from './Lv95';

import { transformToLv95 } from '../GeoAdmin/projections';

@model('untendurch/LatLon')
export class LatLon extends Model({
  lat: prop<number>(),
  lon: prop<number>(),
}) {
  @computed
  get asLv95(): Lv95 {
    return transformToLv95(this.lon, this.lat);
  }
}

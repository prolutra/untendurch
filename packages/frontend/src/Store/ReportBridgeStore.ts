import type { Point } from 'ol/geom';

import { computed } from 'mobx';
import { model, Model, modelAction, prop } from 'mobx-keystone';
import { Feature } from 'ol';

import type { LatLon } from './LatLon';
import type { Lv95 } from './Lv95';

import { fetchPointInformation } from '../GeoAdmin/FetchPointInformation';
import { latLonToPoint } from '../GeoAdmin/PointTransformations';
import { transformToLv95 } from '../GeoAdmin/projections';

@model('untendurch/ReportBridgeRoute')
export class ReportBridgeStore extends Model({
  canton: prop<string>(() => '').withSetter(),
  latLon: prop<LatLon | null>(() => null).withSetter(),
  municipality: prop<string>(() => '').withSetter(),
}) {
  @computed
  get asLv95(): Lv95 | null {
    if (this.latLon) {
      return transformToLv95(this.latLon.lon, this.latLon.lat);
    }
    return null;
  }

  @computed
  get reportedFeature(): Feature<Point> | null {
    if (this.latLon) {
      const feature = new Feature({
        geometry: latLonToPoint(this.latLon),
      });
      feature.setId('reportedFeature-' + new Date());
      return feature;
    } else {
      return null;
    }
  }

  @modelAction
  async setPosition(latLon: LatLon) {
    return fetchPointInformation(latLonToPoint(latLon)).then((result) => {
      this.setLatLon(latLon);
      this.setCanton(result.canton);
      this.setMunicipality(result.municipality);
    });
  }
}

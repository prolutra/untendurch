import { computed } from 'mobx';
import { getRootStore, model, Model, modelAction, prop } from 'mobx-keystone';
import type { Point } from 'ol/geom';
import { fetchPointInformation } from '../GeoAdmin/FetchPointInformation';
import { latLonToPoint } from '../GeoAdmin/PointTransformations';
import { LatLon } from './LatLon';
import type { RootStore } from './Store';
import { rootStore } from './Store';

@model('untendurch/CurrentPosition')
export class CurrentPositionStore extends Model({
  latLon: prop<LatLon | null>(() => null).withSetter(),
  currentCanton: prop<string | null>(() => null).withSetter(),
  currentMunicipality: prop<string | null>(() => null).withSetter(),
  navigatorWithoutLocationSupport: prop<boolean>(() => false).withSetter(),
}) {
  private store!: RootStore;

  onAttachedToRootStore() {
    this.store = getRootStore<RootStore>(rootStore) as RootStore;
  }

  @computed
  get currentPoint(): Point | null {
    if (this.latLon) {
      return latLonToPoint(this.latLon);
    } else {
      return null;
    }
  }

  @modelAction
  async setPosition(latLon: LatLon) {
    return fetchPointInformation(latLonToPoint(latLon)).then((result) => {
      this.setLatLon(latLon);
      this.setCurrentCanton(result.canton);
      this.setCurrentMunicipality(result.municipality);
    });
  }

  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => {
            this.setNavigatorWithoutLocationSupport(true);
            return reject(error);
          }
        );
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  }

  @modelAction
  async locateMe(): Promise<void> {
    return this.getCurrentPosition().then((position: any) => {
      this.setPosition(
        new LatLon({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      );
    });
  }
}

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

  @modelAction
  async locateMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (currentPosition) => {
          this.setPosition(
            new LatLon({
              lat: currentPosition.coords.latitude,
              lon: currentPosition.coords.longitude,
            })
          );
        },
        () => {
          this.setNavigatorWithoutLocationSupport(true);
        }
      );
    }
  }
}

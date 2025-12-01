import type { Point } from 'ol/geom';

import { computed } from 'mobx';
import { getRootStore, model, Model, modelAction, prop } from 'mobx-keystone';

import type { RootStore } from './Store';

import { fetchPointInformation } from '../GeoAdmin/FetchPointInformation';
import { latLonToPoint } from '../GeoAdmin/PointTransformations';
import { LatLon } from './LatLon';
import { rootStore } from './Store';

export type GeolocationErrorType =
  | 'not_supported'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | null;

@model('untendurch/CurrentPosition')
export class CurrentPositionStore extends Model({
  currentCanton: prop<null | string>(() => null).withSetter(),
  currentMunicipality: prop<null | string>(() => null).withSetter(),
  geolocationError: prop<GeolocationErrorType>(() => null).withSetter(),
  latLon: prop<LatLon | null>(() => null).withSetter(),
  navigatorWithoutLocationSupport: prop<boolean>(() => false).withSetter(),
}) {
  @computed
  get currentPoint(): null | Point {
    if (this.latLon) {
      return latLonToPoint(this.latLon);
    } else {
      return null;
    }
  }

  @computed
  get geolocationErrorMessage(): null | string {
    switch (this.geolocationError) {
      case 'not_supported':
        return 'Geolocation wird von Ihrem Browser nicht unterstützt.';
      case 'permission_denied':
        return 'Standortzugriff wurde verweigert. Bitte erlauben Sie den Zugriff in Ihren Browsereinstellungen.';
      case 'position_unavailable':
        return 'Standort konnte nicht ermittelt werden.';
      case 'timeout':
        return 'Zeitüberschreitung bei der Standortabfrage.';
      default:
        return null;
    }
  }

  private store!: RootStore;

  async getCurrentPosition(): Promise<GeolocationPosition> {
    // Clear previous error
    this.setGeolocationError(null);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        this.setNavigatorWithoutLocationSupport(true);
        this.setGeolocationError('not_supported');
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          this.setNavigatorWithoutLocationSupport(true);

          // Map GeolocationPositionError codes to readable types
          switch (error.code) {
            case GeolocationPositionError.PERMISSION_DENIED:
              this.setGeolocationError('permission_denied');
              break;
            case GeolocationPositionError.POSITION_UNAVAILABLE:
              this.setGeolocationError('position_unavailable');
              break;
            case GeolocationPositionError.TIMEOUT:
              this.setGeolocationError('timeout');
              break;
          }

          reject(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 60000,
          timeout: 10000,
        }
      );
    });
  }

  @modelAction
  async locateMe(): Promise<void> {
    const position = await this.getCurrentPosition();
    return this.setPosition(
      new LatLon({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      })
    );
  }

  onAttachedToRootStore() {
    this.store = getRootStore<RootStore>(rootStore) as RootStore;
  }

  @modelAction
  async setPosition(latLon: LatLon) {
    return fetchPointInformation(latLonToPoint(latLon)).then((result) => {
      this.setLatLon(latLon);
      this.setCurrentCanton(result.canton);
      this.setCurrentMunicipality(result.municipality);
    });
  }
}

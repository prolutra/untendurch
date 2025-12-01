import { computed } from 'mobx';
import { getRootStore, model, Model, modelAction, prop } from 'mobx-keystone';
import type { Point } from 'ol/geom';
import { fetchPointInformation } from '../GeoAdmin/FetchPointInformation';
import { latLonToPoint } from '../GeoAdmin/PointTransformations';
import { LatLon } from './LatLon';
import type { RootStore } from './Store';
import { rootStore } from './Store';

export type GeolocationErrorType =
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'not_supported'
  | null;

@model('untendurch/CurrentPosition')
export class CurrentPositionStore extends Model({
  latLon: prop<LatLon | null>(() => null).withSetter(),
  currentCanton: prop<string | null>(() => null).withSetter(),
  currentMunicipality: prop<string | null>(() => null).withSetter(),
  navigatorWithoutLocationSupport: prop<boolean>(() => false).withSetter(),
  geolocationError: prop<GeolocationErrorType>(() => null).withSetter(),
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
          timeout: 10000,
          maximumAge: 60000,
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

  @computed
  get geolocationErrorMessage(): string | null {
    switch (this.geolocationError) {
      case 'permission_denied':
        return 'Standortzugriff wurde verweigert. Bitte erlauben Sie den Zugriff in Ihren Browsereinstellungen.';
      case 'position_unavailable':
        return 'Standort konnte nicht ermittelt werden.';
      case 'timeout':
        return 'Zeitüberschreitung bei der Standortabfrage.';
      case 'not_supported':
        return 'Geolocation wird von Ihrem Browser nicht unterstützt.';
      default:
        return null;
    }
  }
}

import type { Point } from 'ol/geom';

import { create } from 'zustand';

import type { LatLon } from './LatLon';

import { fetchPointInformation } from '../GeoAdmin/FetchPointInformation';
import { latLonToPoint } from '../GeoAdmin/PointTransformations';
import { createLatLon } from './LatLon';

export type CurrentPositionStore = CurrentPositionActions &
  CurrentPositionGetters &
  CurrentPositionState;

export type GeolocationErrorType =
  | 'not_supported'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | null;

interface CurrentPositionActions {
  getCurrentPosition: () => Promise<GeolocationPosition>;
  locateMe: () => Promise<void>;
  setCurrentCanton: (canton: null | string) => void;
  setCurrentMunicipality: (municipality: null | string) => void;
  setGeolocationError: (error: GeolocationErrorType) => void;
  setLatLon: (latLon: LatLon | null) => void;
  setNavigatorWithoutLocationSupport: (value: boolean) => void;
  setPosition: (latLon: LatLon) => Promise<void>;
}

interface CurrentPositionGetters {
  currentPoint: () => null | Point;
  geolocationErrorMessage: () => null | string;
}

interface CurrentPositionState {
  currentCanton: null | string;
  currentMunicipality: null | string;
  geolocationError: GeolocationErrorType;
  latLon: LatLon | null;
  navigatorWithoutLocationSupport: boolean;
}

export const useCurrentPositionStore = create<CurrentPositionStore>(
  (set, get) => ({
    currentCanton: null,
    currentMunicipality: null,
    currentPoint: () => {
      const { latLon } = get();
      if (latLon) {
        return latLonToPoint(latLon);
      }
      return null;
    },
    geolocationError: null,
    geolocationErrorMessage: () => {
      const { geolocationError } = get();
      switch (geolocationError) {
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
    },

    getCurrentPosition: () => {
      return new Promise((resolve, reject) => {
        set({ geolocationError: null });

        if (!navigator.geolocation) {
          set({
            geolocationError: 'not_supported',
            navigatorWithoutLocationSupport: true,
          });
          reject(new Error('Geolocation is not supported by this browser.'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => {
            set({ navigatorWithoutLocationSupport: true });

            switch (error.code) {
              case GeolocationPositionError.PERMISSION_DENIED:
                set({ geolocationError: 'permission_denied' });
                break;
              case GeolocationPositionError.POSITION_UNAVAILABLE:
                set({ geolocationError: 'position_unavailable' });
                break;
              case GeolocationPositionError.TIMEOUT:
                set({ geolocationError: 'timeout' });
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
    },
    latLon: null,
    locateMe: async () => {
      const position = await get().getCurrentPosition();
      await get().setPosition(
        createLatLon(position.coords.latitude, position.coords.longitude)
      );
    },
    navigatorWithoutLocationSupport: false,
    setCurrentCanton: (currentCanton) => set({ currentCanton }),

    setCurrentMunicipality: (currentMunicipality) =>
      set({ currentMunicipality }),

    setGeolocationError: (geolocationError) => set({ geolocationError }),

    setLatLon: (latLon) => set({ latLon }),

    setNavigatorWithoutLocationSupport: (navigatorWithoutLocationSupport) =>
      set({ navigatorWithoutLocationSupport }),

    setPosition: async (latLon: LatLon) => {
      const result = await fetchPointInformation(latLonToPoint(latLon));
      set({
        currentCanton: result.canton,
        currentMunicipality: result.municipality,
        latLon,
      });
    },
  })
);

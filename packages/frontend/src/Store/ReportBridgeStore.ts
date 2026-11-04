import type { Point } from 'ol/geom';

import { Feature } from 'ol';
import { create } from 'zustand';

import type { LatLon } from './LatLon';
import type { Lv95 } from './Lv95';

import { fetchPointInformation } from '../GeoAdmin/FetchPointInformation';
import { latLonToPoint } from '../GeoAdmin/PointTransformations';
import { transformToLv95 } from '../GeoAdmin/projections';

/**
 * Where the current position came from. 'fallback' is the centre of
 * Switzerland used when GPS is unavailable: never a valid bridge position.
 */
export type PositionSource =
  | 'drag'
  | 'existing'
  | 'fallback'
  | 'gps'
  | 'manual';

export type ReportBridgeStore = ReportBridgeActions &
  ReportBridgeGetters &
  ReportBridgeState;

interface ReportBridgeActions {
  setCanton: (canton: string) => void;
  setIsReviewing: (isReviewing: boolean) => void;
  setLatLon: (latLon: LatLon | null, source?: PositionSource) => void;
  setManualEntryPending: (manualEntryPending: boolean) => void;
  setManualPosition: (manualPosition: boolean) => void;
  setMunicipality: (municipality: string) => void;
  setPosition: (latLon: LatLon, source: PositionSource) => Promise<void>;
}

interface ReportBridgeGetters {
  asLv95: () => Lv95 | null;
  reportedFeature: () => Feature<Point> | null;
}

interface ReportBridgeState {
  canton: string;
  /** True while the confirmation step is shown: the map must not change the position */
  isReviewing: boolean;
  latLon: LatLon | null;
  /**
   * True while the manual-coordinates panel is open and its input has not
   * been applied: the form must not be submitted with the old position.
   */
  manualEntryPending: boolean;
  /**
   * True once the user set the position by hand (typed coordinates or dragged
   * the pin), so a late GPS fix must not overwrite it.
   */
  manualPosition: boolean;
  municipality: string;
  positionSource: null | PositionSource;
}

export const useReportBridgeStore = create<ReportBridgeStore>((set, get) => ({
  asLv95: () => {
    const { latLon } = get();
    if (latLon) {
      return transformToLv95(latLon.lon, latLon.lat);
    }
    return null;
  },
  canton: '',
  isReviewing: false,
  latLon: null,
  manualEntryPending: false,
  manualPosition: false,

  municipality: '',
  positionSource: null,
  reportedFeature: () => {
    const { latLon } = get();
    if (latLon) {
      const feature = new Feature({
        geometry: latLonToPoint(latLon),
      });
      feature.setId('reportedFeature-' + new Date());
      return feature;
    }
    return null;
  },
  setCanton: (canton) => set({ canton }),

  setIsReviewing: (isReviewing) => set({ isReviewing }),

  setLatLon: (latLon, source) =>
    set({ latLon, positionSource: latLon ? (source ?? null) : null }),

  setManualEntryPending: (manualEntryPending) => set({ manualEntryPending }),

  setManualPosition: (manualPosition) => set({ manualPosition }),

  setMunicipality: (municipality) => set({ municipality }),

  setPosition: async (latLon: LatLon, source: PositionSource) => {
    const result = await fetchPointInformation(latLonToPoint(latLon));
    set({
      canton: result.canton,
      latLon,
      municipality: result.municipality,
      positionSource: source,
    });
  },
}));

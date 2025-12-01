import type { Point } from 'ol/geom';

import { Feature } from 'ol';
import { create } from 'zustand';

import type { LatLon } from './LatLon';
import type { Lv95 } from './Lv95';

import { fetchPointInformation } from '../GeoAdmin/FetchPointInformation';
import { latLonToPoint } from '../GeoAdmin/PointTransformations';
import { transformToLv95 } from '../GeoAdmin/projections';

export type ReportBridgeStore = ReportBridgeActions &
  ReportBridgeGetters &
  ReportBridgeState;

interface ReportBridgeActions {
  setCanton: (canton: string) => void;
  setLatLon: (latLon: LatLon | null) => void;
  setMunicipality: (municipality: string) => void;
  setPosition: (latLon: LatLon) => Promise<void>;
}

interface ReportBridgeGetters {
  asLv95: () => Lv95 | null;
  reportedFeature: () => Feature<Point> | null;
}

interface ReportBridgeState {
  canton: string;
  latLon: LatLon | null;
  municipality: string;
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
  latLon: null,

  municipality: '',
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

  setLatLon: (latLon) => set({ latLon }),

  setMunicipality: (municipality) => set({ municipality }),

  setPosition: async (latLon: LatLon) => {
    const result = await fetchPointInformation(latLonToPoint(latLon));
    set({
      canton: result.canton,
      latLon,
      municipality: result.municipality,
    });
  },
}));

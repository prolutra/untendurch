import { create } from 'zustand';

import { AllFilter } from './AllFilter';

export type MapMode = 'FULL' | 'NONE' | 'TOP';

export type MapSettingsStore = MapSettingsActions & MapSettingsState;

const DEFAULT_CENTER = [916355.3315324377, 5909283.341607826];
const DEFAULT_ZOOM = 9;

interface MapSettingsActions {
  restoreMainMapState: () => void;
  saveMainMapState: () => void;
  setCenter: (center: number[]) => void;
  setClassName: (className: string) => void;
  setContainerClassName: (containerClassName: string) => void;
  setFilterCanton: (filterCanton: string) => void;
  setFilterMunicipality: (filterMunicipality: string) => void;
  setFilterOtterFriendly: (filterOtterFriendly: string) => void;
  setFilterSafetyRisk: (filterSafetyRisk: string) => void;
  setFilterStatus: (filterStatus: string) => void;
  setMode: (mode: MapMode) => void;
  setSelectedBridgePinObjectId: (objectId: null | string) => void;
  setZoom: (zoom: number) => void;
}

interface MapSettingsState {
  center: number[];
  className: string;
  containerClassName: string;
  filterCanton: string;
  filterMunicipality: string;
  filterOtterFriendly: string;
  filterSafetyRisk: string;
  filterStatus: string;
  mode: MapMode;
  savedMainMapCenter: null | number[];
  savedMainMapZoom: null | number;
  selectedBridgePinObjectId: null | string;
  zoom: number;
}

export const useMapSettingsStore = create<MapSettingsStore>((set, get) => ({
  center: DEFAULT_CENTER,
  className: 'ol-map',
  containerClassName: '',
  filterCanton: AllFilter,
  filterMunicipality: AllFilter,
  filterOtterFriendly: AllFilter,
  filterSafetyRisk: AllFilter,
  filterStatus: AllFilter,
  mode: 'FULL',
  restoreMainMapState: () => {
    const { savedMainMapCenter, savedMainMapZoom } = get();
    set({
      center: savedMainMapCenter ?? DEFAULT_CENTER,
      savedMainMapCenter: null,
      savedMainMapZoom: null,
      zoom: savedMainMapZoom ?? DEFAULT_ZOOM,
    });
  },
  savedMainMapCenter: null,
  savedMainMapZoom: null,
  saveMainMapState: () => {
    const { center, zoom } = get();
    set({
      savedMainMapCenter: center,
      savedMainMapZoom: zoom,
    });
  },
  selectedBridgePinObjectId: null,
  setCenter: (center) => set({ center }),

  setClassName: (className) => set({ className }),
  setContainerClassName: (containerClassName) => set({ containerClassName }),
  setFilterCanton: (filterCanton) => set({ filterCanton }),
  setFilterMunicipality: (filterMunicipality) => set({ filterMunicipality }),
  setFilterOtterFriendly: (filterOtterFriendly) => set({ filterOtterFriendly }),
  setFilterSafetyRisk: (filterSafetyRisk) => set({ filterSafetyRisk }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setMode: (mode) => set({ mode }),
  setSelectedBridgePinObjectId: (selectedBridgePinObjectId) =>
    set({ selectedBridgePinObjectId }),
  setZoom: (zoom) => set({ zoom }),
  zoom: DEFAULT_ZOOM,
}));

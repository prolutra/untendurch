import { create } from 'zustand';

import { AllFilter } from './AllFilter';

export type MapMode = 'FULL' | 'NONE' | 'TOP';

export type MapSettingsStore = MapSettingsActions & MapSettingsState;

const DEFAULT_CENTER = [916355.3315324377, 5909283.341607826];
const DEFAULT_ZOOM = 8.5; // Matches minZoom for fully zoomed out view

const STORAGE_KEY = 'untendurch-map-state';
const SELECTED_BRIDGE_KEY = 'untendurch-selected-bridge';

interface PersistedMapState {
  center: number[];
  zoom: number;
}

export function clearPersistedMapState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SELECTED_BRIDGE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

function isDefaultState(center: number[], zoom: number): boolean {
  return (
    center[0] === DEFAULT_CENTER[0] &&
    center[1] === DEFAULT_CENTER[1] &&
    zoom === DEFAULT_ZOOM
  );
}

function loadPersistedState(): null | PersistedMapState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PersistedMapState;
      // Validate the stored data
      if (
        Array.isArray(parsed.center) &&
        parsed.center.length === 2 &&
        typeof parsed.zoom === 'number'
      ) {
        return parsed;
      }
    }
  } catch {
    // Ignore localStorage errors
  }
  return null;
}

function loadSelectedBridge(): null | string {
  try {
    return localStorage.getItem(SELECTED_BRIDGE_KEY);
  } catch {
    return null;
  }
}

function persistSelectedBridge(objectId: null | string): void {
  try {
    if (objectId) {
      localStorage.setItem(SELECTED_BRIDGE_KEY, objectId);
    } else {
      localStorage.removeItem(SELECTED_BRIDGE_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}

function persistState(center: number[], zoom: number): void {
  // Don't persist default values - this prevents overwriting user's saved state
  // during initial page load when the map hasn't moved yet
  if (isDefaultState(center, zoom)) {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ center, zoom }));
  } catch {
    // Ignore localStorage errors
  }
}

// Load persisted state on module initialization
const persistedState = loadPersistedState();
const persistedSelectedBridge = loadSelectedBridge();

interface MapSettingsActions {
  clearOverlappingBridgeIds: () => void;
  restoreMainMapState: () => void;
  saveMainMapState: () => void;
  setCenter: (center: number[]) => void;
  setClassName: (className: string) => void;
  setClusteringEnabled: (clusteringEnabled: boolean) => void;
  setContainerClassName: (containerClassName: string) => void;
  setFilterAdmin: (filterAdmin: string) => void;
  setFilterCanton: (filterCanton: string) => void;
  setFilterMunicipality: (filterMunicipality: string) => void;
  setFilterOtterFriendly: (filterOtterFriendly: string) => void;
  setFilterSafetyRisk: (filterSafetyRisk: string) => void;
  setFilterStatus: (filterStatus: string) => void;
  setMode: (mode: MapMode) => void;
  setOverlappingBridgeIds: (ids: string[]) => void;
  setSelectedBridgePinObjectId: (objectId: null | string) => void;
  setShowRiskyPinsUnclustered: (showRiskyPinsUnclustered: boolean) => void;
  setVisibleBridgeIds: (ids: string[]) => void;
  setZoom: (zoom: number) => void;
}

interface MapSettingsState {
  center: number[];
  className: string;
  clusteringEnabled: boolean;
  containerClassName: string;
  filterAdmin: string;
  filterCanton: string;
  filterMunicipality: string;
  filterOtterFriendly: string;
  filterSafetyRisk: string;
  filterStatus: string;
  mode: MapMode;
  overlappingBridgeIds: string[];
  savedMainMapCenter: null | number[];
  savedMainMapZoom: null | number;
  selectedBridgePinObjectId: null | string;
  showRiskyPinsUnclustered: boolean;
  visibleBridgeIds: string[];
  zoom: number;
}

export const useMapSettingsStore = create<MapSettingsStore>((set, get) => ({
  center: persistedState?.center ?? DEFAULT_CENTER,
  className: 'ol-map',
  clearOverlappingBridgeIds: () => set({ overlappingBridgeIds: [] }),
  clusteringEnabled: true,
  containerClassName: '',
  filterAdmin: AllFilter,
  filterCanton: AllFilter,
  filterMunicipality: AllFilter,
  filterOtterFriendly: AllFilter,
  filterSafetyRisk: AllFilter,
  filterStatus: AllFilter,
  mode: 'FULL',
  overlappingBridgeIds: [],
  restoreMainMapState: () => {
    const { savedMainMapCenter, savedMainMapZoom } = get();
    const newCenter = savedMainMapCenter ?? DEFAULT_CENTER;
    const newZoom = savedMainMapZoom ?? DEFAULT_ZOOM;
    set({
      center: newCenter,
      savedMainMapCenter: null,
      savedMainMapZoom: null,
      zoom: newZoom,
    });
    persistState(newCenter, newZoom);
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
  selectedBridgePinObjectId: persistedSelectedBridge,
  setCenter: (center) => {
    set({ center });
    persistState(center, get().zoom);
  },

  setClassName: (className) => set({ className }),
  setClusteringEnabled: (clusteringEnabled) => set({ clusteringEnabled }),
  setContainerClassName: (containerClassName) => set({ containerClassName }),
  setFilterAdmin: (filterAdmin) => set({ filterAdmin }),
  setFilterCanton: (filterCanton) => set({ filterCanton }),
  setFilterMunicipality: (filterMunicipality) => set({ filterMunicipality }),
  setFilterOtterFriendly: (filterOtterFriendly) => set({ filterOtterFriendly }),
  setFilterSafetyRisk: (filterSafetyRisk) => set({ filterSafetyRisk }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setMode: (mode) => set({ mode }),
  setOverlappingBridgeIds: (overlappingBridgeIds) =>
    set({ overlappingBridgeIds }),
  setSelectedBridgePinObjectId: (selectedBridgePinObjectId) => {
    set({ selectedBridgePinObjectId });
    persistSelectedBridge(selectedBridgePinObjectId);
  },
  setShowRiskyPinsUnclustered: (showRiskyPinsUnclustered) =>
    set({ showRiskyPinsUnclustered }),
  setVisibleBridgeIds: (visibleBridgeIds) => set({ visibleBridgeIds }),
  setZoom: (zoom) => {
    set({ zoom });
    persistState(get().center, zoom);
  },
  showRiskyPinsUnclustered: false,
  visibleBridgeIds: [],
  zoom: persistedState?.zoom ?? DEFAULT_ZOOM,
}));

import { useAuthStore } from './AuthStore';
import { useCantonMunicipalityStore } from './CantonMunicipalityStore';
import { useCurrentPositionStore } from './CurrentPositionStore';
import { useExistingBridgesStore } from './ExistingBridgesStore';
import { useMapSettingsStore } from './MapSettingsStore';
import { useReportBridgeStore } from './ReportBridgeStore';

// Re-export all stores for easy access
export {
  useAuthStore,
  useCantonMunicipalityStore,
  useCurrentPositionStore,
  useExistingBridgesStore,
  useMapSettingsStore,
  useReportBridgeStore,
};

// Combined store hook for backward compatibility
export function useStore() {
  return {
    auth: useAuthStore(),
    cantonMunicipality: useCantonMunicipalityStore(),
    currentPosition: useCurrentPositionStore(),
    existingBridges: useExistingBridgesStore(),
    mapSettings: useMapSettingsStore(),
    reportBridge: useReportBridgeStore(),
  };
}

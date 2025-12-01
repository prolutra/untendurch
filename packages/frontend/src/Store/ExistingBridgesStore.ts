import type { GeoPoint } from 'parse';

import Parse from 'parse';
import { create } from 'zustand';

import type { BridgePin } from './BridgePin';
import type { BridgeStatus } from './BridgeStatus';
import type { SafetyRisk } from './SafetyRisk';

import { AllFilter } from './AllFilter';
import { createBridgePin } from './BridgePin';
import { createLatLon } from './LatLon';
import { useMapSettingsStore } from './MapSettingsStore';

export type ExistingBridgesStore = ExistingBridgesActions &
  ExistingBridgesGetters &
  ExistingBridgesState;

interface ExistingBridgesActions {
  bridgeById: (objectId: string) => BridgePin | undefined;
  deleteBridge: (objectId: string) => Promise<void>;
  fetchExistingBridges: () => Promise<void>;
  setBridgePins: (bridgePins: BridgePin[]) => void;
  verifyBridge: (objectId: string) => Promise<void>;
}

interface ExistingBridgesGetters {
  filteredBridges: () => BridgePin[];
}

interface ExistingBridgesState {
  bridgePins: BridgePin[];
}

export const useExistingBridgesStore = create<ExistingBridgesStore>(
  (set, get) => ({
    bridgeById: (objectId: string) => {
      return get()
        .filteredBridges()
        .find((bridgePin) => bridgePin.objectId === objectId);
    },

    bridgePins: [],

    deleteBridge: async (objectId: string) => {
      const query = new Parse.Query('Bridge');
      const existingBridge = await query.get(objectId);
      await existingBridge.destroy();

      set({
        bridgePins: get().bridgePins.filter(
          (bridgePin) => bridgePin.objectId !== objectId
        ),
      });
    },

    fetchExistingBridges: async () => {
      const query = new Parse.Query('Bridge');
      const bridges = await query.limit(9999).find();

      const data = bridges.map((bridge) => {
        const objectId = bridge.id;
        const name = bridge.attributes['name'] as string;
        const position = bridge.attributes['position'] as GeoPoint;
        const bridgeIndex = bridge.attributes['bridgeIndex'] as number;
        const safetyRisk = bridge.attributes['safetyRisk'] as SafetyRisk;
        const cantons = bridge.attributes['cantons'] as string[];
        const municipality = bridge.attributes['municipalities'] as string[];
        const status = bridge.attributes['status'] as BridgeStatus;
        const otterFriendly = bridge.attributes['otterFriendly'] as string;
        const images = bridge.attributes['images'] as Parse.File[];
        const nickname = bridge.attributes['nickname'] as string;
        const shape = bridge.attributes['shape'] as string;
        const averageDailyTraffic = bridge.attributes[
          'averageDailyTraffic'
        ] as number;

        const imageUrl = images && images[0] ? (images[0].url() ?? '') : '';

        return createBridgePin({
          averageDailyTraffic: averageDailyTraffic,
          bridgeIndex: bridgeIndex,
          cantons: cantons,
          imageUrl: imageUrl,
          latLon: createLatLon(position.latitude, position.longitude),
          municipalities: municipality,
          name: name,
          nickname: nickname,
          objectId: objectId ?? '',
          otterFriendly: otterFriendly,
          safetyRisk: safetyRisk,
          shape: shape,
          status: status,
        });
      });

      set({ bridgePins: data });
    },

    filteredBridges: () => {
      const mapSettings = useMapSettingsStore.getState();
      return get()
        .bridgePins.filter(
          (b) =>
            mapSettings.filterMunicipality === AllFilter ||
            b.municipalities.includes(mapSettings.filterMunicipality)
        )
        .filter(
          (b) =>
            mapSettings.filterCanton === AllFilter ||
            b.cantons.includes(mapSettings.filterCanton)
        )
        .filter(
          (b) =>
            mapSettings.filterStatus === AllFilter ||
            b.status === mapSettings.filterStatus
        )
        .filter(
          (b) =>
            mapSettings.filterOtterFriendly === AllFilter ||
            b.otterFriendly === mapSettings.filterOtterFriendly
        )
        .filter(
          (b) =>
            mapSettings.filterSafetyRisk === AllFilter ||
            b.safetyRisk === mapSettings.filterSafetyRisk
        );
    },

    setBridgePins: (bridgePins) => set({ bridgePins }),

    verifyBridge: async (objectId: string) => {
      const query = new Parse.Query('Bridge');
      const existingBridge = await query.get(objectId);
      existingBridge.set('status', 'VERIFIED');
      await existingBridge.save();

      set({
        bridgePins: get().bridgePins.map((bridgePin) => {
          if (bridgePin.objectId === objectId) {
            return { ...bridgePin, status: 'VERIFIED' as BridgeStatus };
          }
          return bridgePin;
        }),
      });
    },
  })
);

/**
 * Initialize by fetching existing bridges.
 * Must be called after Parse is initialized.
 */
export function initializeExistingBridgesStore() {
  useExistingBridgesStore.getState().fetchExistingBridges();
}

import type { Point } from 'ol/geom';
import type { FC } from 'react';

import { Feature } from 'ol';
import React, { useMemo } from 'react';

import type { BridgePin } from '../Store/BridgePin';
import type { SafetyRisk } from '../Store/SafetyRisk';

import { latLonToPoint } from '../GeoAdmin/PointTransformations';
import { Layers } from '../Layers/Layers';
import { TileLayer } from '../Layers/TileLayers';
import { VectorLayer } from '../Layers/VectorLayers';
import { SafetyRisk as SafetyRiskEnum } from '../Store/SafetyRisk';
import {
  useExistingBridgesStore,
  useMapSettingsStore,
  useReportBridgeStore,
} from '../Store/Store';

// Risk levels that should be excluded from clustering when showRiskyPinsUnclustered is enabled
const RISKY_SAFETY_LEVELS: SafetyRisk[] = [
  SafetyRiskEnum.MEDIUM_RISK,
  SafetyRiskEnum.HIGH_RISK,
  SafetyRiskEnum.VERY_HIGH_RISK,
];

export const Map: FC = () => {
  // Use individual selectors to avoid unnecessary re-renders
  const filteredBridges = useExistingBridgesStore((s) => s.filteredBridges);
  const reportedFeature = useReportBridgeStore((s) => s.reportedFeature);
  const showRiskyUnclustered = useMapSettingsStore(
    (s) => s.showRiskyPinsUnclustered
  );
  // Subscribe to filter changes to trigger re-computation
  const filterCanton = useMapSettingsStore((s) => s.filterCanton);
  const filterMunicipality = useMapSettingsStore((s) => s.filterMunicipality);
  const filterStatus = useMapSettingsStore((s) => s.filterStatus);
  const filterOtterFriendly = useMapSettingsStore((s) => s.filterOtterFriendly);
  const filterSafetyRisk = useMapSettingsStore((s) => s.filterSafetyRisk);
  const filterAdmin = useMapSettingsStore((s) => s.filterAdmin);
  const bridgePins = useExistingBridgesStore((s) => s.bridgePins);

  const vectorLayersBySafety = useMemo((): [
    Feature<Point>[],
    string,
    number,
    SafetyRisk | undefined,
  ][] => {
    const result =
      Array.of<[Feature<Point>[], string, number, SafetyRisk | undefined]>();

    filteredBridges()
      .groupBy((b: BridgePin) => b.safetyRisk)
      .forEach((bridges: BridgePin[], safetyRisk: SafetyRisk | undefined) => {
        const iconSrc = safetyRisk
          ? `/bridge_pin_${safetyRisk.toLowerCase()}.svg`
          : 'bridge_pin.svg';
        const features = bridges.map(
          (bridge: BridgePin) =>
            new Feature({
              bridgePinObjectId: bridge.objectId,
              geometry: latLonToPoint(bridge.latLon),
            })
        );
        // the higher the safety risk the higher up in zIndex
        const zIndex =
          10 +
          (safetyRisk ? Object.keys(SafetyRiskEnum).indexOf(safetyRisk) : 0);
        result.push([features, iconSrc, zIndex, safetyRisk]);
      });
    return result;
  }, [
    bridgePins,
    filterCanton,
    filterMunicipality,
    filterStatus,
    filterOtterFriendly,
    filterSafetyRisk,
    filterAdmin, // Added missing dependency
    filteredBridges,
  ]);

  return (
    <Layers>
      <TileLayer zIndex={0} />
      {vectorLayersBySafety.map(([features, iconSrc, zIndex, safetyRisk]) => {
        // Exclude risky pins from clustering if the option is enabled
        const excludeFromClustering =
          showRiskyUnclustered &&
          safetyRisk !== undefined &&
          RISKY_SAFETY_LEVELS.includes(safetyRisk);

        return (
          <VectorLayer
            draggable={false}
            excludeFromClustering={excludeFromClustering}
            features={features}
            iconSrc={iconSrc}
            key={iconSrc}
            zIndex={zIndex}
          />
        );
      })}
      {reportedFeature() && (
        <VectorLayer
          draggable={true}
          features={[reportedFeature()!]}
          iconSrc={'/bridge_pin_new.svg'}
          zIndex={99}
        />
      )}
    </Layers>
  );
};

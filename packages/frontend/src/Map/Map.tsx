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
  const reportedLatLon = useReportBridgeStore((s) => s.latLon);
  // Memoized: a new array on every render would rebuild the draggable layer
  // (and its Modify interaction) each time, interrupting drags
  const reportedFeatures = useMemo(
    () =>
      reportedLatLon
        ? [new Feature({ geometry: latLonToPoint(reportedLatLon) })]
        : [],
    [reportedLatLon]
  );
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

  /**
   * All bridges go into ONE clustered layer so that bubbles are computed across
   * all safety risks (one cluster source per risk produced stacked, partially
   * counted bubbles). Each feature carries its own icon and z-order instead.
   * Risky bridges can optionally be kept out of the clusters.
   */
  const [clusteredFeatures, unclusteredFeatures] = useMemo(() => {
    const clustered: Feature<Point>[] = [];
    const unclustered: Feature<Point>[] = [];
    const riskOrder = Object.keys(SafetyRiskEnum);

    filteredBridges().forEach((bridge: BridgePin) => {
      const safetyRisk = bridge.safetyRisk as SafetyRisk | undefined;
      const feature = new Feature({
        bridgePinObjectId: bridge.objectId,
        geometry: latLonToPoint(bridge.latLon),
        iconSrc: safetyRisk
          ? `/bridge_pin_${safetyRisk.toLowerCase()}.svg`
          : '/bridge_pin.svg',
        // the higher the safety risk the higher up
        zIndex: safetyRisk ? riskOrder.indexOf(safetyRisk) + 1 : 0,
      });
      const keepUnclustered =
        showRiskyUnclustered &&
        safetyRisk !== undefined &&
        RISKY_SAFETY_LEVELS.includes(safetyRisk);
      (keepUnclustered ? unclustered : clustered).push(feature);
    });

    return [clustered, unclustered];
  }, [
    bridgePins,
    filterCanton,
    filterMunicipality,
    filterStatus,
    filterOtterFriendly,
    filterSafetyRisk,
    filterAdmin,
    filteredBridges,
    showRiskyUnclustered,
  ]);
  const clusteringEnabled = useMapSettingsStore((s) => s.clusteringEnabled);

  return (
    <Layers>
      <TileLayer zIndex={0} />
      <VectorLayer
        clustered={clusteringEnabled}
        draggable={false}
        features={clusteredFeatures}
        zIndex={10}
      />
      {/* Kept out of clusters and always above the bubbles */}
      <VectorLayer
        draggable={false}
        features={unclusteredFeatures}
        zIndex={20}
      />
      {reportedFeatures.length > 0 && (
        <VectorLayer
          draggable={true}
          features={reportedFeatures}
          iconSrc={'/bridge_pin_new.svg'}
          zIndex={99}
        />
      )}
    </Layers>
  );
};

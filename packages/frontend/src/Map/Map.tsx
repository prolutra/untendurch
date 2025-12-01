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
import { useStore } from '../Store/Store';

export const Map: FC = () => {
  const store = useStore();

  const vectorLayersBySafety = useMemo((): [
    Feature<Point>[],
    string,
    number,
  ][] => {
    const result = Array.of<[Feature<Point>[], string, number]>();

    store.existingBridges
      .filteredBridges()
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
        result.push([features, iconSrc, zIndex]);
      });
    return result;
  }, [
    store.existingBridges.bridgePins,
    store.mapSettings.filterCanton,
    store.mapSettings.filterMunicipality,
    store.mapSettings.filterStatus,
    store.mapSettings.filterOtterFriendly,
    store.mapSettings.filterSafetyRisk,
  ]);

  const reportedFeature = store.reportBridge.reportedFeature();

  return (
    <Layers>
      <TileLayer zIndex={0} />
      {vectorLayersBySafety.map(([features, iconSrc, zIndex]) => (
        <VectorLayer
          draggable={false}
          features={features}
          iconSrc={iconSrc}
          key={iconSrc}
          zIndex={zIndex}
        />
      ))}
      {reportedFeature && (
        <VectorLayer
          draggable={true}
          features={[reportedFeature]}
          iconSrc={'/bridge_pin_new.svg'}
          zIndex={99}
        />
      )}
    </Layers>
  );
};

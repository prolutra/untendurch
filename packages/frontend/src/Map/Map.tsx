import type { Point } from 'ol/geom';
import type { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { Feature } from 'ol';
import React, { useMemo } from 'react';

import { latLonToPoint } from '../GeoAdmin/PointTransformations';
import { Layers } from '../Layers/Layers';
import { TileLayer } from '../Layers/TileLayers';
import { VectorLayer } from '../Layers/VectorLayers';
import { SafetyRisk } from '../Store/SafetyRisk';
import { useStore } from '../Store/Store';

export const Map: FC = observer(() => {
  const store = useStore();

  const vectorLayersBySafety = useMemo((): [
    Feature<Point>[],
    string,
    number,
  ][] => {
    const result = Array.of<[Feature<Point>[], string, number]>();

    store.existingBridges.filteredBridges
      .groupBy((b) => b.safetyRisk)
      .forEach((bridges, safetyRisk) => {
        const iconSrc = safetyRisk
          ? `/bridge_pin_${safetyRisk.toLowerCase()}.svg`
          : 'bridge_pin.svg';
        const features = bridges.map(
          (bridge) =>
            new Feature({
              bridgePinObjectId: bridge.objectId,
              geometry: latLonToPoint(bridge.latLon),
            })
        );
        // the higher the safety risk the higher up in zIndex
        const zIndex =
          10 + (safetyRisk ? Object.keys(SafetyRisk).indexOf(safetyRisk) : 0);
        result.push([features, iconSrc, zIndex]);
      });
    return result;
  }, [store.existingBridges.filteredBridges]);

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
      {store.reportBridge.reportedFeature && (
        <VectorLayer
          draggable={true}
          features={[store.reportBridge.reportedFeature]}
          iconSrc={'/bridge_pin_new.svg'}
          zIndex={99}
        />
      )}
    </Layers>
  );
});

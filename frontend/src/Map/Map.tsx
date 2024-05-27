import type { FC } from 'react';
import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../Store/Store';
import { Feature } from 'ol';
import type { Point } from 'ol/geom';
import { latLonToPoint } from '../GeoAdmin/PointTransformations';
import { SafetyRisk } from '../Store/SafetyRisk';
import { VectorLayer } from '../Layers/VectorLayers';
import { Layers } from '../Layers/Layers';
import { TileLayer } from '../Layers/TileLayers';

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
              geometry: latLonToPoint(bridge.latLon),
              bridgePinObjectId: bridge.objectId,
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
          key={iconSrc}
          zIndex={zIndex}
          features={features}
          iconSrc={iconSrc}
          draggable={false}
        />
      ))}
      {store.reportBridge.reportedFeature && (
        <VectorLayer
          zIndex={99}
          features={[store.reportBridge.reportedFeature]}
          iconSrc={'/bridge_pin_new.svg'}
          draggable={true}
        />
      )}
    </Layers>
  );
});

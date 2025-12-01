import type { Feature } from 'ol';
import type { Geometry, Point } from 'ol/geom';
import type { StyleFunction } from 'ol/style/Style';
import type { FC } from 'react';

import { Modify } from 'ol/interaction';
import OLVectorLayer from 'ol/layer/Vector';
import { toLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import React, { useCallback, useContext, useEffect } from 'react';

import { MapContext } from '../Map/MapContext';
import { createLatLon } from '../Store/LatLon';
import { useStore } from '../Store/Store';

/**
 * Pin icon dimensions and styling constants
 * The SVG pin icon is 214px wide x 240px tall at original size
 */
const PIN_ICON = {
  // Anchor at horizontal center (0.5 = 50% of width)
  ANCHOR_X: 0.5,
  // Anchor at bottom tip of pin (1.0 = 100% of height, i.e., the very bottom)
  ANCHOR_Y: 1.0,
  // Default scale factor (icon scaled to ~45% of original)
  SCALE_DEFAULT: 0.45,
  // Hovered scale factor (icon scaled to ~55% of original)
  SCALE_HOVERED: 0.55,
  // Hovered pins appear on top of all others
  Z_INDEX_HOVERED: 10000,
} as const;

type VectorLayerProps = {
  draggable: boolean;
  features: Feature<Geometry>[];
  iconSrc: string;
  zIndex: number;
};

export const VectorLayer: FC<VectorLayerProps> = ({
  draggable,
  features,
  iconSrc,
  zIndex,
}) => {
  const store = useStore();

  const mapContext = useContext(MapContext);

  const addFeaturesToMap = useCallback((): [
    OLVectorLayer<Feature<Geometry>> | undefined,
    Modify | undefined,
  ] => {
    if (!mapContext) return [undefined, undefined];

    const source = new VectorSource({
      features: features,
    });

    const style = new Style({
      image: new Icon({
        anchor: [PIN_ICON.ANCHOR_X, PIN_ICON.ANCHOR_Y],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        scale: PIN_ICON.SCALE_DEFAULT,
        src: iconSrc,
      }),
    });

    const styleHovered = new Style({
      image: new Icon({
        anchor: [PIN_ICON.ANCHOR_X, PIN_ICON.ANCHOR_Y],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        scale: PIN_ICON.SCALE_HOVERED,
        src: iconSrc,
      }),
      zIndex: PIN_ICON.Z_INDEX_HOVERED,
    });

    const styleFunction: StyleFunction = (feature) => {
      return feature.get('hovered') ? styleHovered : style;
    };

    const layer = new OLVectorLayer({
      source,
      style: styleFunction,
      zIndex,
    });

    mapContext.addLayer(layer);

    const interaction = new Modify({
      hitDetection: layer,
      source: source,
    });

    if (draggable) {
      interaction.on('modifyend', (event) => {
        event.features.forEach((feature) => {
          const point = (feature.getGeometry() as Point).getCoordinates();
          const lonLat = toLonLat(point);
          store.reportBridge
            .setPosition(createLatLon(lonLat[1], lonLat[0]))
            .then(() => {
              store.mapSettings.setCenter(point);
            });
        });

        store.mapSettings.setZoom(17);
      });

      mapContext.addInteraction(interaction);

      return [layer, interaction];
    }

    return [layer, undefined];
  }, [mapContext, features]);

  useEffect(() => {
    const currentPoint = store.currentPosition.currentPoint();
    if (currentPoint) {
      store.mapSettings.setCenter(currentPoint.getCoordinates());
      store.mapSettings.setZoom(17);
    }
  }, [store.currentPosition.latLon]);

  useEffect(() => {
    if (!mapContext) return;

    let layerAndInteraction: [
      OLVectorLayer<Feature<Geometry>> | undefined,
      Modify | undefined,
    ];

    if (features.length > 0) {
      layerAndInteraction = addFeaturesToMap();
    }

    return () => {
      if (layerAndInteraction) {
        if (layerAndInteraction[0]) {
          mapContext.removeLayer(layerAndInteraction[0]);
        }

        if (layerAndInteraction[1]) {
          mapContext.removeInteraction(layerAndInteraction[1]);
        }
      }
    };
  }, [mapContext, features.length]);

  return <></>;
};

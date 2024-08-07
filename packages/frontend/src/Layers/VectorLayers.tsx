import type { Feature } from 'ol';
import type { Geometry, Point } from 'ol/geom';
import OLVectorLayer from 'ol/layer/Vector';
import { Icon, Style } from 'ol/style';
import { Modify } from 'ol/interaction';
import type { FC } from 'react';
import React, { useCallback, useContext, useEffect } from 'react';
import { useStore } from '../Store/Store';
import { observer } from 'mobx-react-lite';
import { toLonLat } from 'ol/proj';
import { LatLon } from '../Store/LatLon';
import type { StyleFunction } from 'ol/style/Style';
import { MapContext } from '../Map/MapContext';
import { OverlayContext } from '../Map/OverlayContext';
import VectorSource from 'ol/source/Vector';

type VectorLayerProps = {
  zIndex: number;
  features: Feature<Geometry>[];
  iconSrc: string;
  draggable: boolean;
};

export const VectorLayer: FC<VectorLayerProps> = observer(
  ({ zIndex, features, iconSrc, draggable }) => {
    const store = useStore();

    const mapContext = useContext(MapContext);
    const overlayContext = useContext(OverlayContext);

    const addFeaturesToMap = useCallback((): [
      OLVectorLayer<Feature<Geometry>> | undefined,
      Modify | undefined,
    ] => {
      if (!mapContext || !overlayContext) return [undefined, undefined];

      const source = new VectorSource({
        features: features,
      });

      const style = new Style({
        image: new Icon({
          anchor: [0.5, 107],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: iconSrc,
          scale: 0.45,
        }),
      });

      const styleHovered = new Style({
        image: new Icon({
          anchor: [0.5, 98],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: iconSrc,
          scale: 0.55,
        }),
        zIndex: 10000,
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
        source: source,
        hitDetection: layer,
      });

      if (draggable) {
        interaction.on('modifyend', (event) => {
          event.features.forEach((feature) => {
            const point = (feature.getGeometry() as Point).getCoordinates();
            const lonLat = toLonLat(point);
            store.reportBridge
              .setPosition(
                new LatLon({
                  lat: lonLat[1],
                  lon: lonLat[0],
                })
              )
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
    }, [mapContext, overlayContext, features]);

    useEffect(() => {
      if (store.currentPosition.currentPoint) {
        store.mapSettings.setCenter(
          store.currentPosition.currentPoint.getCoordinates()
        );
        store.mapSettings.setZoom(17);
      }
    }, [store.currentPosition.currentPoint]);

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
  }
);

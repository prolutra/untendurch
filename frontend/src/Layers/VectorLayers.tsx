import type { Feature } from 'ol';
import type { Geometry, Point } from 'ol/geom';
import OLVectorLayer from 'ol/layer/Vector';
import { Vector } from 'ol/source';
import { Icon, Style } from 'ol/style';
import { Modify } from 'ol/interaction';
import React, { useContext, useEffect } from 'react';
import MapContext from '../Map/MapContext';
import { useStore } from '../Store/Store';
import { observer } from 'mobx-react-lite';
import { toLonLat } from 'ol/proj';
import { LatLon } from '../Store/LatLon';
import OverlayContext from '../Map/OverlayContext';

export interface VectorLayerProps {
  zIndex: number;
  features: Feature<Point>[];
  iconSrc: string;
  draggable: boolean;
}

const VectorLayer = observer(
  ({ zIndex, features, iconSrc, draggable }: VectorLayerProps) => {
    const store = useStore();

    const mapContext = useContext(MapContext);
    const overlayContext = useContext(OverlayContext);

    function addFeaturesToMap(): [
      OLVectorLayer<Vector<Feature<Geometry>>> | undefined,
      Modify | undefined,
    ] {
      if (!mapContext || !overlayContext) return [undefined, undefined];

      const source = new Vector({
        features: features,
      });

      const style = new Style({
        image: new Icon({
          anchor: [0.5, 98],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: iconSrc,
        }),
      });

      const layer = new OLVectorLayer({
        source,
        style,
        zIndex,
      });

      mapContext.addLayer(layer);

      if (draggable) {
        const interaction = new Modify({
          source: source,
          hitDetection: layer,
        });

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
    }

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
        OLVectorLayer<Vector<Feature<Geometry>>> | undefined,
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

export default VectorLayer;

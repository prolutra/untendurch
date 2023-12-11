import React, { useEffect, useRef, useState } from 'react';
import './Map.css';
import MapContext from './MapContext';
import * as ol from 'ol';
import { Feature } from 'ol';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { useStore } from '../Store/Store';
import { observer } from 'mobx-react-lite';
import { Box } from 'theme-ui';
import OverlayContext from './OverlayContext';
import { Select } from 'ol/interaction';
import type { Point } from 'ol/geom';
import BridgePinInfo from './BridgePinInfo';
import type { FeatureLike } from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import { useLocation } from 'react-router-dom';

interface MapWrapperProps {
  children: React.ReactNode;
}

const MapWrapper = observer(({ children }: MapWrapperProps) => {
  const store = useStore();

  const mapRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mapContext, setMap] = useState<ol.Map | null>(null);
  const [overlayContext, setOverlay] = useState<ol.Overlay | null>(null);
  const pathname = useLocation().pathname;

  useEffect(() => {
    if (!popoverRef.current) throw Error('popoverRef is not assigned');

    if (!mapRef.current) throw Error('mapRef is not assigned');

    const overlay = new ol.Overlay({
      element: popoverRef.current,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });

    setOverlay(overlay);

    const options = {
      view: new ol.View({
        projection: 'EPSG:3857',
        center: store.mapSettings.center,
        zoom: store.mapSettings.zoom,
      }),
      layers: [],
      controls: defaultControls().extend([
        new ScaleLine({
          units: 'metric',
        }),
      ]),
      overlays: [overlay],
    };
    const mapObject = new ol.Map(options);

    const select = new Select({ style: null });
    select.on('select', (event) => {
      const feature = event.selected[0];
      if (feature) {
        const point = feature.getGeometry() as Point;
        const coordinates = point.getCoordinates();
        const bridgePinObjectId = feature.get('bridgePinObjectId') as string;
        store.mapSettings.setSelectedBridgePinObjectId(bridgePinObjectId);
        overlay.setPosition(coordinates);
      } else {
        overlay.setPosition(undefined);
      }
    });

    mapObject.addInteraction(select);

    // Add a pointermove handler to the map to change the cursor to a pointer on hover over any feature
    mapObject.on('pointermove', function (evt) {
      let activeFeature: FeatureLike | Feature | undefined;
      const hit = mapObject.forEachFeatureAtPixel(evt.pixel, (feature) => {
        activeFeature = feature;
        return true;
      });

      mapObject.getLayers().forEach(function (layer) {
        if (layer instanceof VectorLayer) {
          layer.getSource().forEachFeature(function (feature: Feature) {
            feature.set('hovered', false);
          });
        }
      });

      if (hit) {
        if (activeFeature instanceof Feature) {
          activeFeature.set('hovered', true);
        }

        mapObject.getTargetElement().style.cursor = 'pointer';
      } else {
        mapObject.getTargetElement().style.cursor = '';
      }
    });

    mapObject.setTarget(mapRef.current);
    setMap(mapObject);
    return () => mapObject.setTarget(undefined);
  }, []);

  useEffect(() => {
    if ('TOP' === store.mapSettings.mode) {
      store.mapSettings.setContainerClassName('map-container-in-reporting');
      store.mapSettings.setClassName('ol-map-top');
    } else {
      store.mapSettings.setContainerClassName('');
      store.mapSettings.setClassName('ol-map');
    }

    // unfortunately, we have to force a size update to resize the tile layer
    setTimeout(() => {
      if (mapContext) mapContext.updateSize();
    }, 200);
  }, [store.mapSettings.mode]);

  useEffect(() => {
    if (mapContext) {
      mapContext.updateSize();
      const size = mapContext.getSize();
      if (size) {
        mapContext.getView().setZoom(store.mapSettings.zoom);
        mapContext
          .getView()
          .centerOn(store.mapSettings.center, size, [size[0] / 2, size[1] / 2]);
      }
    }
  }, [store.mapSettings.center]);

  const hasOverlay = pathname.includes('/new');

  return (
    <MapContext.Provider value={mapContext}>
      <OverlayContext.Provider value={overlayContext}>
        {store.mapSettings.mode !== 'NONE' && (
          <>
            <Box
              sx={{
                zIndex: 1001,
                position: 'absolute',
                left: '50%',
                top: '50%',
                backgroundColor: 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                borderRadius: '15px',
                width: 'calc(72vw)',
                maxWidth: '400px',
                marginLeft: 'calc(max(-36vw, -200px))',
              }}
              ref={popoverRef}
            >
              <Box id="popoverContent">
                <BridgePinInfo></BridgePinInfo>
              </Box>
            </Box>
            <Box
              sx={
                hasOverlay
                  ? { position: 'relative', width: '100%', height: [200, 300] }
                  : {
                      position: 'absolute',
                      width: '100%',
                      height: ['calc(100% - 60px)', 'calc(100% - 88px)'],
                    }
              }
              ref={mapRef}
            >
              {children}
            </Box>
          </>
        )}
      </OverlayContext.Provider>
    </MapContext.Provider>
  );
});

export default MapWrapper;

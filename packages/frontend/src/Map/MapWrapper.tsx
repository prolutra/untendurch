import type { FeatureLike } from 'ol/Feature';

import './Map.css';
import type { Geometry, Point } from 'ol/geom';
import type VectorSource from 'ol/source/Vector';

import * as ol from 'ol';
import { Feature } from 'ol';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { Select } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import React, { useEffect, useRef, useState } from 'react';

import { useStore } from '../Store/Store';
import { BridgeSidebar } from './BridgeSidebar';
import { Map } from './Map';
import { MapContext } from './MapContext';

type Props = {
  children?: React.ReactNode;
  variant?: 'small';
};

export const MapWrapper = ({ children, variant }: Props) => {
  const store = useStore();

  const mapRef = useRef<HTMLDivElement>(null);
  const [mapContext, setMapContext] = useState<null | ol.Map>(null);
  const [selectContext, setSelectContext] = useState<null | Select>(null);

  useEffect(() => {
    if (!mapRef.current) throw Error('mapRef is not assigned');

    const options = {
      controls: defaultControls().extend([
        new ScaleLine({
          units: 'metric',
        }),
      ]),
      layers: [],
      overlays: [],
      view: new ol.View({
        center: store.mapSettings.center,
        projection: 'EPSG:3857',
        zoom: store.mapSettings.zoom,
      }),
    };
    const mapObject = new ol.Map(options);

    mapObject.setTarget(mapRef.current);
    setMapContext(mapObject);
    return () => mapObject.setTarget(undefined);
  }, []);

  useEffect(() => {
    if (!mapContext) return;
    const select = new Select({ style: null });
    select.on('select', (event) => {
      const selectedFeature = event.selected[0] as Feature<Point>;
      if (selectedFeature) {
        const bridgePinObjectId = selectedFeature.get(
          'bridgePinObjectId'
        ) as string;
        store.mapSettings.setSelectedBridgePinObjectId(bridgePinObjectId);
      } else {
        store.mapSettings.setSelectedBridgePinObjectId(null);
      }
    });

    mapContext.addInteraction(select);
    setSelectContext(select);

    return () => {
      mapContext.removeInteraction(select);
    };
  }, [mapContext]);

  useEffect(() => {
    if (!mapContext) return;
    // Add a pointermove handler to the map to change the cursor to a pointer on hover over any feature
    mapContext.on('pointermove', function (evt) {
      let activeFeature: Feature | FeatureLike | undefined;
      const hit = mapContext.forEachFeatureAtPixel(evt.pixel, (feature) => {
        activeFeature = feature;
        return true;
      });

      mapContext.getLayers().forEach(function (layer) {
        if (layer instanceof VectorLayer) {
          const source = layer.getSource() as null | VectorSource<
            Feature<Geometry>
          >;
          source?.forEachFeature(function (feature) {
            feature.set('hovered', false);
          });
        }
      });

      if (hit) {
        if (activeFeature instanceof Feature) {
          activeFeature.set('hovered', true);
        }

        mapContext.getTargetElement().style.cursor = 'pointer';
      } else {
        mapContext.getTargetElement().style.cursor = '';
      }
    });
  }, [mapContext]);

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
    }, 50);
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
  }, [store.mapSettings.center, store.mapSettings.zoom, mapContext]);

  // Update map size when sidebar opens/closes
  useEffect(() => {
    if (mapContext) {
      // Wait for CSS transition to complete (300ms)
      const timeout = setTimeout(() => {
        mapContext.updateSize();
      }, 310);
      return () => clearTimeout(timeout);
    }
  }, [store.mapSettings.selectedBridgePinObjectId, mapContext]);

  function deselectBridgePin() {
    selectContext?.getFeatures().clear();
    store.mapSettings.setSelectedBridgePinObjectId(null);
  }

  return (
    <MapContext.Provider value={mapContext}>
      {store.mapSettings.mode !== 'NONE' && (
        <div className={variant === 'small' ? '' : 'flex h-full w-full'}>
          <BridgeSidebar onClose={deselectBridgePin} />
          <div
            className={
              variant === 'small'
                ? 'z-0 relative w-full h-[200px] sm:h-[300px]'
                : 'z-0 h-full flex-1 min-w-0 relative'
            }
            ref={mapRef}
          >
            <Map></Map>
            {children}
          </div>
        </div>
      )}
    </MapContext.Provider>
  );
};

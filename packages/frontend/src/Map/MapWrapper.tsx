import React, { useEffect, useRef, useState } from 'react';
import './Map.css';
import * as ol from 'ol';
import { Feature } from 'ol';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { useStore } from '../Store/Store';
import { observer } from 'mobx-react-lite';
import { Select } from 'ol/interaction';
import type { Point } from 'ol/geom';
import type { FeatureLike } from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import { MapContext } from './MapContext';
import { OverlayContext } from './OverlayContext';
import { Map } from './Map';
import { BridgePinInfo } from './BridgePinInfo';

type Props = {
  variant?: 'small';
};

export const MapWrapper = observer(({ variant }: Props) => {
  const store = useStore();

  const mapRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mapContext, setMapContext] = useState<ol.Map | null>(null);
  const [overlayContext, setOverlayContext] = useState<ol.Overlay | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature<Point> | null>(
    null
  );
  const [selectContext, setSelectContext] = useState<Select | null>(null);

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

    setOverlayContext(overlay);

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

    mapObject.setTarget(mapRef.current);
    setMapContext(mapObject);
    return () => mapObject.setTarget(undefined);
  }, []);

  useEffect(() => {
    if (!mapContext || !overlayContext) return;
    const select = new Select({ style: null });
    select.on('select', (event) => {
      const selectedFeature = event.selected[0] as Feature<Point>;
      if (selectedFeature) {
        setSelectedFeature(selectedFeature);
        const coordinates = selectedFeature?.getGeometry()?.getCoordinates();
        const bridgePinObjectId = selectedFeature.get(
          'bridgePinObjectId'
        ) as string;
        store.mapSettings.setSelectedBridgePinObjectId(bridgePinObjectId);
        overlayContext.setPosition(coordinates);
      } else {
        overlayContext.setPosition(undefined);
        setSelectedFeature(null);
      }
    });

    mapContext.addInteraction(select);
    setSelectContext(select);

    return () => {
      mapContext.removeInteraction(select);
    };
  }, [mapContext, overlayContext]);

  useEffect(() => {
    if (!mapContext) return;
    // Add a pointermove handler to the map to change the cursor to a pointer on hover over any feature
    mapContext.on('pointermove', function (evt) {
      let activeFeature: FeatureLike | Feature | undefined;
      const hit = mapContext.forEachFeatureAtPixel(evt.pixel, (feature) => {
        activeFeature = feature;
        return true;
      });

      mapContext.getLayers().forEach(function (layer) {
        if (layer instanceof VectorLayer) {
          // @ts-ignore
          layer.getSource().forEachFeature(function (feature: Feature) {
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
  }, [store.mapSettings.center]);

  function deselectBridgePin() {
    selectContext?.getFeatures().clear();
    setSelectedFeature(null);
  }

  return (
    <MapContext.Provider value={mapContext}>
      <OverlayContext.Provider value={overlayContext}>
        {store.mapSettings.mode !== 'NONE' && (
          <>
            <div
              draggable
              className={`z-40 absolute bg-white shadow-md rounded-xl w-80 -translate-x-1/2`}
              ref={popoverRef}
            >
              {selectedFeature && (
                <div id="popoverContent">
                  <BridgePinInfo closeFn={deselectBridgePin}></BridgePinInfo>
                </div>
              )}
            </div>
            <div
              className={
                variant === 'small'
                  ? 'z-0 relative w-full h-[200px] sm:h-[300px]'
                  : 'z-0 h-full w-full'
              }
              ref={mapRef}
            >
              <Map></Map>
            </div>
          </>
        )}
      </OverlayContext.Provider>
    </MapContext.Provider>
  );
});

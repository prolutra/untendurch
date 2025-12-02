import type { Point } from 'ol/geom';

import './Map.css';

import * as ol from 'ol';
import { Feature } from 'ol';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { Translate } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { toLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import { Icon, Style } from 'ol/style';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { latLonToPoint } from '../GeoAdmin/PointTransformations';
import { createLatLon } from '../Store/LatLon';
import { useReportBridgeStore } from '../Store/ReportBridgeStore';
import { useReportMapStore } from '../Store/ReportMapStore';
import { MapContext } from './MapContext';

/**
 * Simplified map component for the bridge reporting form.
 * Uses its own isolated store (ReportMapStore) that doesn't persist to localStorage.
 * This map instance is created fresh each time the form is opened and destroyed when closed.
 */
export const ReportMapWrapper = () => {
  const center = useReportMapStore((s) => s.center);
  const zoom = useReportMapStore((s) => s.zoom);
  const setCenter = useReportMapStore((s) => s.setCenter);
  const setZoom = useReportMapStore((s) => s.setZoom);

  // Get latLon state directly, not via the getter function which creates new objects
  const latLon = useReportBridgeStore((s) => s.latLon);

  // Memoize the feature creation to avoid infinite loops
  const reportedFeature = useMemo(() => {
    if (latLon) {
      const feature = new Feature({
        geometry: latLonToPoint(latLon),
      });
      feature.setId('reportedFeature');
      return feature;
    }
    return null;
  }, [latLon]);

  const mapRef = useRef<HTMLDivElement>(null);
  const [mapContext, setMapContext] = useState<null | ol.Map>(null);
  const vectorSourceRef = useRef<null | VectorSource>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const initialCenter = useReportMapStore.getState().center;
    const initialZoom = useReportMapStore.getState().zoom;

    // Create tile layer with Swiss map tiles
    const tileLayer = new TileLayer({
      source: new XYZ({
        attributions:
          '&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>',
        url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg',
      }),
    });

    // Create vector source for the new bridge pin
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          scale: 0.6,
          src: '/bridge_pin_new.svg',
        }),
      }),
      zIndex: 99,
    });

    const mapObject = new ol.Map({
      controls: defaultControls().extend([
        new ScaleLine({
          units: 'metric',
        }),
      ]),
      layers: [tileLayer, vectorLayer],
      view: new ol.View({
        center: initialCenter,
        maxZoom: 19,
        minZoom: 8.5,
        projection: 'EPSG:3857',
        zoom: initialZoom,
      }),
    });

    mapObject.setTarget(mapRef.current);

    // Force map to update its size after mounting
    setTimeout(() => {
      mapObject.updateSize();
    }, 0);

    // Add translate interaction for dragging the pin
    const translate = new Translate({
      layers: [vectorLayer],
    });

    translate.on('translateend', () => {
      const features = vectorSource.getFeatures();
      if (features.length > 0) {
        const feature = features[0] as Feature<Point>;
        const geometry = feature.getGeometry();
        if (geometry) {
          // Update the reported bridge position when pin is dragged
          const coords = geometry.getCoordinates();
          const lonLat = toLonLat(coords);
          const latLon = createLatLon(lonLat[1], lonLat[0]);
          useReportBridgeStore.getState().setPosition(latLon);
        }
      }
    });

    mapObject.addInteraction(translate);

    // Track map movements (but don't persist to localStorage)
    const handleMoveEnd = () => {
      const view = mapObject.getView();
      const newCenter = view.getCenter();
      const newZoom = view.getZoom();
      if (newCenter && newZoom !== undefined) {
        setCenter(newCenter);
        setZoom(newZoom);
      }
    };
    mapObject.on('moveend', handleMoveEnd);

    setMapContext(mapObject);

    return () => {
      mapObject.setTarget(undefined);
      mapObject.un('moveend', handleMoveEnd);
    };
  }, []);

  // Update vector source when reported feature changes
  useEffect(() => {
    if (!vectorSourceRef.current) return;

    vectorSourceRef.current.clear();
    if (reportedFeature) {
      vectorSourceRef.current.addFeature(reportedFeature);
    }
  }, [reportedFeature]);

  // Sync store center/zoom to map view
  useEffect(() => {
    if (!mapContext) return;

    const view = mapContext.getView();
    const currentCenter = view.getCenter();
    const currentZoom = view.getZoom();

    // Only update if significantly different to avoid loops
    const centerChanged =
      !currentCenter ||
      Math.abs(currentCenter[0] - center[0]) > 1 ||
      Math.abs(currentCenter[1] - center[1]) > 1;
    const zoomChanged =
      currentZoom === undefined || Math.abs(currentZoom - zoom) > 0.1;

    if (centerChanged || zoomChanged) {
      view.animate({
        center,
        duration: 300,
        zoom,
      });
    }
  }, [center, zoom, mapContext]);

  return (
    <MapContext.Provider value={mapContext}>
      <div
        className="relative z-0 h-[200px] w-full sm:h-[300px]"
        ref={mapRef}
      />
    </MapContext.Provider>
  );
};

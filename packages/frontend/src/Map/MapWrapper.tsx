import type { FeatureLike } from 'ol/Feature';

import './Map.css';
import type { Geometry, Point } from 'ol/geom';
import type VectorSource from 'ol/source/Vector';

import * as ol from 'ol';
import { Feature } from 'ol';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { boundingExtent, containsCoordinate } from 'ol/extent';
import { Select } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import React, { useEffect, useRef, useState } from 'react';

import { useMapSettingsStore } from '../Store/Store';
import { BridgeSidebar } from './BridgeSidebar';
import { Map } from './Map';
import { MapContext } from './MapContext';
import { MapDebugInfo } from './MapDebugInfo';

type Props = {
  children?: React.ReactNode;
  variant?: 'small';
};

export const MapWrapper = ({ children, variant }: Props) => {
  // Use individual selectors to avoid unnecessary re-renders
  const mode = useMapSettingsStore((s) => s.mode);
  const center = useMapSettingsStore((s) => s.center);
  const zoom = useMapSettingsStore((s) => s.zoom);
  const selectedBridgePinObjectId = useMapSettingsStore(
    (s) => s.selectedBridgePinObjectId
  );
  const setOverlappingBridgeIds = useMapSettingsStore(
    (s) => s.setOverlappingBridgeIds
  );
  const setSelectedBridgePinObjectId = useMapSettingsStore(
    (s) => s.setSelectedBridgePinObjectId
  );
  const setContainerClassName = useMapSettingsStore(
    (s) => s.setContainerClassName
  );
  const setClassName = useMapSettingsStore((s) => s.setClassName);
  const setCenter = useMapSettingsStore((s) => s.setCenter);
  const setZoom = useMapSettingsStore((s) => s.setZoom);
  const setVisibleBridgeIds = useMapSettingsStore((s) => s.setVisibleBridgeIds);

  const mapRef = useRef<HTMLDivElement>(null);
  const [mapContext, setMapContext] = useState<null | ol.Map>(null);
  const [selectContext, setSelectContext] = useState<null | Select>(null);
  // Track if map has been initialized with persisted state to avoid overwriting it
  const mapInitializedWithPersistedState = useRef(false);

  // Get initial values from store (already loaded from localStorage at module init)
  const initialCenterRef = useRef(useMapSettingsStore.getState().center);
  const initialZoomRef = useRef(useMapSettingsStore.getState().zoom);

  useEffect(() => {
    if (!mapRef.current) throw Error('mapRef is not assigned');

    // Use store values which are already loaded from localStorage
    const initialCenter = initialCenterRef.current;
    const initialZoom = initialZoomRef.current;

    // Mark that we're initializing with persisted state
    mapInitializedWithPersistedState.current = true;

    const options = {
      controls: defaultControls().extend([
        new ScaleLine({
          units: 'metric',
        }),
      ]),
      layers: [],
      overlays: [],
      view: new ol.View({
        center: initialCenter,
        maxZoom: 19,
        minZoom: 8.5,
        projection: 'EPSG:3857',
        zoom: initialZoom,
      }),
    };
    const mapObject = new ol.Map(options);

    mapObject.setTarget(mapRef.current);
    setMapContext(mapObject);
    return () => mapObject.setTarget(undefined);
  }, []);

  // Zoom threshold at which we show overlapping picker instead of zooming further
  const OVERLAP_ZOOM_THRESHOLD = 17;

  useEffect(() => {
    if (!mapContext) return;
    const select = new Select({ style: null });
    select.on('select', (event) => {
      const selectedFeature = event.selected[0] as Feature<Point>;
      if (selectedFeature) {
        // Check if this is a cluster feature (has 'features' property)
        const clusteredFeatures = selectedFeature.get('features') as
          | Feature<Point>[]
          | undefined;

        if (clusteredFeatures && clusteredFeatures.length > 1) {
          const currentZoom = mapContext.getView().getZoom() ?? 0;

          // At high zoom, show picker for overlapping bridges instead of zooming
          if (currentZoom >= OVERLAP_ZOOM_THRESHOLD) {
            const bridgeIds = clusteredFeatures
              .map((f) => f.get('bridgePinObjectId') as string)
              .filter(Boolean);

            if (bridgeIds.length > 1) {
              // Show the overlapping bridges picker
              setOverlappingBridgeIds(bridgeIds);
              select.getFeatures().clear();
              return;
            }
          }

          // Multi-feature cluster at lower zoom: zoom to show all features
          const extent = boundingExtent(
            clusteredFeatures.map((f) =>
              (f.getGeometry() as Point).getCoordinates()
            )
          );
          mapContext.getView().fit(extent, {
            duration: 300,
            maxZoom: 19,
            padding: [50, 50, 50, 50],
          });
          // Clear selection so we can re-click after zoom
          select.getFeatures().clear();
          setSelectedBridgePinObjectId(null);
        } else if (clusteredFeatures && clusteredFeatures.length === 1) {
          // Single feature cluster: select the bridge
          const bridgePinObjectId = clusteredFeatures[0].get(
            'bridgePinObjectId'
          ) as string;
          setSelectedBridgePinObjectId(bridgePinObjectId);
        } else {
          // Non-clustered feature (e.g., new bridge pin)
          const bridgePinObjectId = selectedFeature.get(
            'bridgePinObjectId'
          ) as string;
          setSelectedBridgePinObjectId(bridgePinObjectId);
        }
      } else {
        setSelectedBridgePinObjectId(null);
      }
    });

    mapContext.addInteraction(select);
    setSelectContext(select);

    return () => {
      mapContext.removeInteraction(select);
    };
  }, [mapContext]);

  // Track last hovered feature to avoid iterating all features on every mouse move
  const lastHoveredFeatureRef = useRef<Feature | null>(null);

  useEffect(() => {
    if (!mapContext) return;
    // Add a pointermove handler to the map to change the cursor to a pointer on hover over any feature
    const handlePointerMove = (evt: ol.MapBrowserEvent<PointerEvent>) => {
      let activeFeature: Feature | FeatureLike | undefined;
      const hit = mapContext.forEachFeatureAtPixel(evt.pixel, (feature) => {
        activeFeature = feature;
        return true;
      });

      // Only update features that changed - avoid iterating all features
      const lastHovered = lastHoveredFeatureRef.current;
      if (lastHovered && lastHovered !== activeFeature) {
        lastHovered.set('hovered', false);
      }

      if (hit && activeFeature instanceof Feature) {
        if (activeFeature !== lastHovered) {
          activeFeature.set('hovered', true);
        }
        lastHoveredFeatureRef.current = activeFeature;
        mapContext.getTargetElement().style.cursor = 'pointer';
      } else {
        lastHoveredFeatureRef.current = null;
        mapContext.getTargetElement().style.cursor = '';
      }
    };

    mapContext.on('pointermove', handlePointerMove);
    return () => {
      mapContext.un('pointermove', handlePointerMove);
    };
  }, [mapContext]);

  useEffect(() => {
    if ('TOP' === mode) {
      setContainerClassName('map-container-in-reporting');
      setClassName('ol-map-top');
    } else {
      setContainerClassName('');
      setClassName('ol-map');
    }

    // unfortunately, we have to force a size update to resize the tile layer
    setTimeout(() => {
      if (mapContext) mapContext.updateSize();
    }, 50);
  }, [mode, setContainerClassName, setClassName, mapContext]);

  useEffect(() => {
    if (!mapContext) return;

    // Skip if map was initialized with persisted state - don't overwrite it
    // This ref is set to true during map creation when localStorage has state
    if (mapInitializedWithPersistedState.current) {
      mapInitializedWithPersistedState.current = false;
      return;
    }

    mapContext.updateSize();
    const size = mapContext.getSize();
    if (size) {
      mapContext.getView().setZoom(zoom);
      mapContext.getView().centerOn(center, size, [size[0] / 2, size[1] / 2]);
    }
  }, [center, zoom, mapContext]);

  // Update map size when sidebar opens/closes
  useEffect(() => {
    if (mapContext) {
      // Wait for CSS transition to complete (300ms)
      const timeout = setTimeout(() => {
        mapContext.updateSize();
      }, 310);
      return () => clearTimeout(timeout);
    }
  }, [selectedBridgePinObjectId, mapContext]);

  // Track visible bridges and persist map state when map moves or zooms
  useEffect(() => {
    if (!mapContext) return;

    const updateVisibleBridges = (persistState: boolean) => {
      const view = mapContext.getView();
      const extent = view.calculateExtent(mapContext.getSize());

      // Persist current map state to localStorage via store (only on user interaction)
      if (persistState) {
        const newCenter = view.getCenter();
        const newZoom = view.getZoom();
        if (newCenter && newZoom !== undefined) {
          setCenter(newCenter);
          setZoom(newZoom);
        }
      }

      const visibleIds: string[] = [];

      // Iterate through all vector layers to find features in view
      mapContext.getLayers().forEach((layer) => {
        if (layer instanceof VectorLayer) {
          const source = layer.getSource() as null | VectorSource<
            Feature<Geometry>
          >;
          if (!source) return;

          // Handle cluster sources
          const features = source.getFeatures();
          features.forEach((feature) => {
            // Check if it's a cluster feature
            const clusteredFeatures = feature.get('features') as
              | Feature<Point>[]
              | undefined;
            if (clusteredFeatures) {
              // It's a cluster - check each inner feature
              clusteredFeatures.forEach((innerFeature) => {
                const geom = innerFeature.getGeometry();
                if (geom && containsCoordinate(extent, geom.getCoordinates())) {
                  const bridgeId = innerFeature.get(
                    'bridgePinObjectId'
                  ) as string;
                  if (bridgeId && !visibleIds.includes(bridgeId)) {
                    visibleIds.push(bridgeId);
                  }
                }
              });
            } else {
              // Regular feature
              const geom = feature.getGeometry() as Point | undefined;
              if (geom && containsCoordinate(extent, geom.getCoordinates())) {
                const bridgeId = feature.get('bridgePinObjectId') as string;
                if (bridgeId && !visibleIds.includes(bridgeId)) {
                  visibleIds.push(bridgeId);
                }
              }
            }
          });
        }
      });

      setVisibleBridgeIds(visibleIds);
    };

    // Initial update (don't persist - just calculate visible bridges)
    updateVisibleBridges(false);

    // Listen for map move/zoom events
    const handleMoveEnd = () => updateVisibleBridges(true);
    mapContext.on('moveend', handleMoveEnd);

    // Also update when layers are added (features may load after map init)
    const layers = mapContext.getLayers();
    const handleLayerChange = () => {
      // Delay slightly to allow cluster source to process features
      setTimeout(() => updateVisibleBridges(false), 100);
    };
    layers.on('add', handleLayerChange);

    return () => {
      mapContext.un('moveend', handleMoveEnd);
      layers.un('add', handleLayerChange);
    };
  }, [mapContext]);

  function deselectBridgePin() {
    selectContext?.getFeatures().clear();
    setSelectedBridgePinObjectId(null);
  }

  return (
    <MapContext.Provider value={mapContext}>
      {mode !== 'NONE' && (
        <div className={variant === 'small' ? '' : 'flex h-full w-full'}>
          <BridgeSidebar onClose={deselectBridgePin} />
          <div
            className={
              variant === 'small'
                ? 'relative z-0 h-[200px] w-full sm:h-[300px]'
                : 'relative z-0 h-full min-w-0 flex-1'
            }
            ref={mapRef}
          >
            <Map></Map>
            <MapDebugInfo />
            {children}
          </div>
        </div>
      )}
    </MapContext.Provider>
  );
};

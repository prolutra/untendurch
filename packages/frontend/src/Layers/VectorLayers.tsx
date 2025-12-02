import type { Feature } from 'ol';
import type { Geometry, Point } from 'ol/geom';
import type { StyleFunction } from 'ol/style/Style';
import type { FC } from 'react';

import { Modify } from 'ol/interaction';
import OLVectorLayer from 'ol/layer/Vector';
import { toLonLat } from 'ol/proj';
import Cluster from 'ol/source/Cluster';
import VectorSource from 'ol/source/Vector';
import {
  Circle as CircleStyle,
  Fill,
  Icon,
  Stroke,
  Style,
  Text,
} from 'ol/style';
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

/**
 * Cluster configuration constants
 * Distance decreases as zoom increases, so clusters break apart when zooming in
 */
const CLUSTER_CONFIG = {
  // Base distance in pixels for clustering at low zoom levels
  DISTANCE_BASE: 80,
  // Minimum distance in pixels for clustering at high zoom levels
  DISTANCE_MIN: 40,
  // Minimum distance between cluster centers (should be >= 2 * max cluster radius to prevent overlap)
  MIN_DISTANCE: 65,
  // Zoom level at which clustering is disabled completely
  ZOOM_THRESHOLD_DISABLE: 14,
  // Zoom level at which clustering reaches minimum
  ZOOM_THRESHOLD_HIGH: 14,
  // Zoom level at which clustering starts to decrease
  ZOOM_THRESHOLD_LOW: 8,
} as const;

/**
 * Calculate cluster distance based on zoom level
 * Higher zoom = smaller distance = clusters break apart sooner
 * At zoom 15+, clustering is disabled completely (distance = 0)
 */
function getClusterDistance(zoom: number): number {
  // Disable clustering at high zoom levels
  if (zoom >= CLUSTER_CONFIG.ZOOM_THRESHOLD_DISABLE) {
    return 0;
  }
  if (zoom <= CLUSTER_CONFIG.ZOOM_THRESHOLD_LOW) {
    return CLUSTER_CONFIG.DISTANCE_BASE;
  }
  if (zoom >= CLUSTER_CONFIG.ZOOM_THRESHOLD_HIGH) {
    return CLUSTER_CONFIG.DISTANCE_MIN;
  }
  // Linear interpolation between thresholds
  const ratio =
    (zoom - CLUSTER_CONFIG.ZOOM_THRESHOLD_LOW) /
    (CLUSTER_CONFIG.ZOOM_THRESHOLD_HIGH - CLUSTER_CONFIG.ZOOM_THRESHOLD_LOW);
  return (
    CLUSTER_CONFIG.DISTANCE_BASE -
    ratio * (CLUSTER_CONFIG.DISTANCE_BASE - CLUSTER_CONFIG.DISTANCE_MIN)
  );
}

/**
 * Cluster styling constants
 */
const CLUSTER_STYLE = {
  // Fill color for cluster circles
  FILL_COLOR: 'rgba(59, 130, 246, 0.8)',
  // Fill color for hovered cluster circles
  FILL_COLOR_HOVERED: 'rgba(59, 130, 246, 1)',
  // Font for cluster count
  FONT: 'bold 12px sans-serif',
  // Base radius for cluster circles
  RADIUS_BASE: 14,
  // Maximum radius
  RADIUS_MAX: 30,
  // Additional radius per feature (for scaling based on count)
  RADIUS_PER_FEATURE: 0.5,
  // Stroke color for cluster circles
  STROKE_COLOR: '#fff',
  // Stroke width
  STROKE_WIDTH: 2,
  // Stroke width for hovered
  STROKE_WIDTH_HOVERED: 3,
  // Text color
  TEXT_COLOR: '#fff',
} as const;

type VectorLayerProps = {
  draggable: boolean;
  excludeFromClustering?: boolean;
  features: Feature<Geometry>[];
  iconSrc: string;
  zIndex: number;
};

export const VectorLayer: FC<VectorLayerProps> = ({
  draggable,
  excludeFromClustering = false,
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

    const vectorSource = new VectorSource({
      features: features,
    });

    // Single pin styles (for non-clustered or single-feature clusters)
    const singlePinStyle = new Style({
      image: new Icon({
        anchor: [PIN_ICON.ANCHOR_X, PIN_ICON.ANCHOR_Y],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        scale: PIN_ICON.SCALE_DEFAULT,
        src: iconSrc,
      }),
    });

    const singlePinStyleHovered = new Style({
      image: new Icon({
        anchor: [PIN_ICON.ANCHOR_X, PIN_ICON.ANCHOR_Y],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        scale: PIN_ICON.SCALE_HOVERED,
        src: iconSrc,
      }),
      zIndex: PIN_ICON.Z_INDEX_HOVERED,
    });

    // Cache for cluster styles to avoid recreating them
    const clusterStyleCache: Record<string, Style> = {};

    // Create cluster style based on feature count and hover state
    const getClusterStyle = (size: number, hovered: boolean = false): Style => {
      const cacheKey = `${size}-${hovered}`;
      if (!clusterStyleCache[cacheKey]) {
        const radius = Math.min(
          CLUSTER_STYLE.RADIUS_BASE + size * CLUSTER_STYLE.RADIUS_PER_FEATURE,
          CLUSTER_STYLE.RADIUS_MAX
        );
        clusterStyleCache[cacheKey] = new Style({
          image: new CircleStyle({
            fill: new Fill({
              color: hovered
                ? CLUSTER_STYLE.FILL_COLOR_HOVERED
                : CLUSTER_STYLE.FILL_COLOR,
            }),
            radius: hovered ? radius + 2 : radius,
            stroke: new Stroke({
              color: CLUSTER_STYLE.STROKE_COLOR,
              width: hovered
                ? CLUSTER_STYLE.STROKE_WIDTH_HOVERED
                : CLUSTER_STYLE.STROKE_WIDTH,
            }),
          }),
          text: new Text({
            fill: new Fill({ color: CLUSTER_STYLE.TEXT_COLOR }),
            font: CLUSTER_STYLE.FONT,
            text: size.toString(),
          }),
        });
      }
      return clusterStyleCache[cacheKey];
    };

    // For draggable pins (new bridge marker), don't use clustering
    if (draggable) {
      const styleFunction: StyleFunction = (feature) => {
        return feature.get('hovered') ? singlePinStyleHovered : singlePinStyle;
      };

      const layer = new OLVectorLayer({
        source: vectorSource,
        style: styleFunction,
        zIndex,
      });

      mapContext.addLayer(layer);

      const interaction = new Modify({
        hitDetection: layer,
        source: vectorSource,
      });

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

    // Check if clustering is enabled and this layer should be clustered
    const clusteringEnabled = store.mapSettings.clusteringEnabled;
    const shouldCluster = clusteringEnabled && !excludeFromClustering;

    if (!shouldCluster) {
      // Non-clustered mode: just show individual pins
      const styleFunction: StyleFunction = (feature) => {
        return feature.get('hovered') ? singlePinStyleHovered : singlePinStyle;
      };

      const layer = new OLVectorLayer({
        source: vectorSource,
        style: styleFunction,
        zIndex,
      });

      mapContext.addLayer(layer);
      return [layer, undefined];
    }

    // For non-draggable pins, use clustering with zoom-dependent distance
    const initialZoom = mapContext.getView().getZoom() ?? 9;
    const initialDistance = getClusterDistance(initialZoom);
    const clusterSource = new Cluster({
      distance: initialDistance,
      minDistance: CLUSTER_CONFIG.MIN_DISTANCE,
      source: vectorSource,
    });

    // Track whether clustering was visually disabled to detect threshold crossings
    let wasClusteringDisabled =
      initialZoom >= CLUSTER_CONFIG.ZOOM_THRESHOLD_DISABLE;
    let layer: null | OLVectorLayer<Feature<Geometry>> = null;

    // Update cluster distance and refresh styles when zoom changes
    const onZoomChange = () => {
      const zoom = mapContext.getView().getZoom() ?? 9;
      const newDistance = getClusterDistance(zoom);
      const isClusteringDisabled =
        zoom >= CLUSTER_CONFIG.ZOOM_THRESHOLD_DISABLE;

      // Update cluster distance
      clusterSource.setDistance(newDistance);

      // Force style refresh when crossing the zoom threshold
      if (isClusteringDisabled !== wasClusteringDisabled && layer) {
        wasClusteringDisabled = isClusteringDisabled;
        layer.changed();
      }
    };

    mapContext.getView().on('change:resolution', onZoomChange);

    const clusterStyleFunction: StyleFunction = (feature) => {
      const clusteredFeatures = feature.get('features') as Feature<Geometry>[];
      const size = clusteredFeatures.length;

      // Get current zoom level to determine if clustering should be visually disabled
      const zoom = mapContext.getView().getZoom() ?? 9;
      const clusteringDisabledByZoom =
        zoom >= CLUSTER_CONFIG.ZOOM_THRESHOLD_DISABLE;

      // Single feature or clustering disabled at high zoom - show pin icon
      if (size === 1 || clusteringDisabledByZoom) {
        return feature.get('hovered') ? singlePinStyleHovered : singlePinStyle;
      }

      // Multiple features at low zoom - show cluster circle with count
      const isHovered = feature.get('hovered') === true;
      return getClusterStyle(size, isHovered);
    };

    layer = new OLVectorLayer({
      source: clusterSource,
      style: clusterStyleFunction,
      zIndex,
    });

    mapContext.addLayer(layer);

    // Store the cleanup function reference
    (
      layer as OLVectorLayer<Feature<Geometry>> & { _zoomListener?: () => void }
    )._zoomListener = onZoomChange;

    return [layer, undefined];
  }, [
    mapContext,
    features,
    store.mapSettings.clusteringEnabled,
    excludeFromClustering,
  ]);

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
  }, [
    mapContext,
    features.length,
    store.mapSettings.clusteringEnabled,
    excludeFromClustering,
  ]);

  return <></>;
};

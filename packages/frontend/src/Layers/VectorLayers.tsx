import type { Feature } from 'ol';
import type { FeatureLike } from 'ol/Feature';
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
import React, { useContext, useEffect, useRef } from 'react';

import { MapContext } from '../Map/MapContext';
import { createLatLon } from '../Store/LatLon';
import { useMapSettingsStore, useStore } from '../Store/Store';

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
  // Selected pins appear on top
  Z_INDEX_SELECTED: 9999,
} as const;

/**
 * Selected pin indicator styling
 */
const SELECTED_INDICATOR = {
  FILL_COLOR: 'rgba(59, 130, 246, 0.9)',
  RADIUS: 8,
  STROKE_COLOR: '#fff',
  STROKE_WIDTH: 3,
} as const;

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
  // Radius of a 2-bridge cluster; grows logarithmically with the count
  RADIUS_BASE: 14,
  // Extra radius when hovered
  RADIUS_HOVER_EXTRA: 2,
  // Maximum radius (reached at ~1000 bridges)
  RADIUS_MAX: 24,
  // Additional radius per order of magnitude of the count
  RADIUS_PER_DECADE: 3.3,
  // Stroke color for cluster circles
  STROKE_COLOR: '#fff',
  // Stroke width
  STROKE_WIDTH: 2,
  // Stroke width for hovered
  STROKE_WIDTH_HOVERED: 3,
  // Text color
  TEXT_COLOR: '#fff',
} as const;

/**
 * Cluster configuration constants
 * Distance decreases as zoom increases, so clusters break apart when zooming in
 */
const CLUSTER_CONFIG = {
  // Distance in pixels for clustering at low zoom levels
  DISTANCE_BASE: 80,
  // Distance in pixels right before clustering is disabled. Cluster centers
  // are kept at least this far apart, so it must be larger than the largest
  // possible bubble diameter (incl. hover and stroke) to prevent overlap.
  DISTANCE_MIN:
    2 *
      (CLUSTER_STYLE.RADIUS_MAX +
        CLUSTER_STYLE.RADIUS_HOVER_EXTRA +
        CLUSTER_STYLE.STROKE_WIDTH_HOVERED) +
    4,
  // Zoom level at which clustering is disabled completely; only bridges at
  // identical positions are still grouped (handled by the overlap picker)
  ZOOM_THRESHOLD_DISABLE: 12,
  // Zoom level at which clustering starts to decrease
  ZOOM_THRESHOLD_LOW: 8,
} as const;

type VectorLayerProps = {
  /** Cluster nearby pins into bubbles (ignored for draggable layers) */
  clustered?: boolean;
  draggable: boolean;
  /**
   * Features may carry their own `iconSrc` and `zIndex` properties (e.g. per
   * safety risk); otherwise the layer's `iconSrc` is used.
   */
  features: Feature<Geometry>[];
  iconSrc?: string;
  zIndex: number;
};

/** From this zoom on, all pins are shown individually */
export const CLUSTER_DISABLE_ZOOM = CLUSTER_CONFIG.ZOOM_THRESHOLD_DISABLE;

/**
 * Calculate cluster distance based on zoom level
 * Higher zoom = smaller distance = clusters break apart sooner
 * At ZOOM_THRESHOLD_DISABLE and above, clustering is disabled (distance = 0)
 */
export function getClusterDistance(zoom: number): number {
  if (zoom >= CLUSTER_CONFIG.ZOOM_THRESHOLD_DISABLE) {
    return 0;
  }
  if (zoom <= CLUSTER_CONFIG.ZOOM_THRESHOLD_LOW) {
    return CLUSTER_CONFIG.DISTANCE_BASE;
  }
  // Linear interpolation between thresholds
  const ratio =
    (zoom - CLUSTER_CONFIG.ZOOM_THRESHOLD_LOW) /
    (CLUSTER_CONFIG.ZOOM_THRESHOLD_DISABLE - CLUSTER_CONFIG.ZOOM_THRESHOLD_LOW);
  return (
    CLUSTER_CONFIG.DISTANCE_BASE -
    ratio * (CLUSTER_CONFIG.DISTANCE_BASE - CLUSTER_CONFIG.DISTANCE_MIN)
  );
}

const pinIcon = (src: string, scale: number) =>
  new Icon({
    anchor: [PIN_ICON.ANCHOR_X, PIN_ICON.ANCHOR_Y],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    scale,
    src,
  });

const selectedIndicatorStyle = new Style({
  image: new CircleStyle({
    fill: new Fill({ color: SELECTED_INDICATOR.FILL_COLOR }),
    radius: SELECTED_INDICATOR.RADIUS,
    stroke: new Stroke({
      color: SELECTED_INDICATOR.STROKE_COLOR,
      width: SELECTED_INDICATOR.STROKE_WIDTH,
    }),
  }),
});

const pinStyleCache: Record<string, Style | Style[]> = {};

/**
 * Pin style for a single bridge. Within a layer, the style zIndex keeps
 * higher-risk pins above lower-risk ones.
 */
function getPinStyle(
  src: string,
  baseZIndex: number,
  selected: boolean,
  hovered: boolean
): Style | Style[] {
  const key = `${src}|${baseZIndex}|${selected}|${hovered}`;
  if (!pinStyleCache[key]) {
    const pin = new Style({
      image: pinIcon(
        src,
        hovered ? PIN_ICON.SCALE_HOVERED : PIN_ICON.SCALE_DEFAULT
      ),
      zIndex: hovered
        ? PIN_ICON.Z_INDEX_HOVERED
        : selected
          ? PIN_ICON.Z_INDEX_SELECTED
          : baseZIndex,
    });
    pinStyleCache[key] = selected ? [selectedIndicatorStyle, pin] : pin;
  }
  return pinStyleCache[key];
}

const clusterStyleCache: Record<string, Style> = {};

function getClusterStyle(size: number, hovered: boolean): Style {
  const key = `${size}|${hovered}`;
  if (!clusterStyleCache[key]) {
    const radius = Math.min(
      CLUSTER_STYLE.RADIUS_BASE +
        CLUSTER_STYLE.RADIUS_PER_DECADE * Math.log10(size / 2),
      CLUSTER_STYLE.RADIUS_MAX
    );
    clusterStyleCache[key] = new Style({
      image: new CircleStyle({
        fill: new Fill({
          color: hovered
            ? CLUSTER_STYLE.FILL_COLOR_HOVERED
            : CLUSTER_STYLE.FILL_COLOR,
        }),
        radius: hovered ? radius + CLUSTER_STYLE.RADIUS_HOVER_EXTRA : radius,
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
      // Bubbles always above single pins of the same layer
      zIndex: PIN_ICON.Z_INDEX_SELECTED - 1,
    });
  }
  return clusterStyleCache[key];
}

export const VectorLayer: FC<VectorLayerProps> = ({
  clustered = false,
  draggable,
  features,
  iconSrc = '/bridge_pin.svg',
  zIndex,
}) => {
  const store = useStore();
  const mapContext = useContext(MapContext);
  const selectedBridgePinObjectId = useMapSettingsStore(
    (s) => s.selectedBridgePinObjectId
  );
  const layerRef = useRef<null | OLVectorLayer<Feature<Geometry>>>(null);

  useEffect(() => {
    const currentPoint = store.currentPosition.currentPoint();
    if (currentPoint) {
      store.mapSettings.setCenter(currentPoint.getCoordinates());
      store.mapSettings.setZoom(17);
    }
  }, [store.currentPosition.latLon]);

  // Selection only changes styling: restyle instead of rebuilding the layer
  // (rebuilding would recompute all clusters on every click)
  useEffect(() => {
    layerRef.current?.changed();
  }, [selectedBridgePinObjectId]);

  useEffect(() => {
    if (!mapContext || features.length === 0) return;

    const vectorSource = new VectorSource({ features });

    // Read at render time so selection changes don't require a rebuild
    const isSelected = (bridgeFeature: FeatureLike) => {
      const selectedId =
        useMapSettingsStore.getState().selectedBridgePinObjectId;
      return (
        !!selectedId && bridgeFeature.get('bridgePinObjectId') === selectedId
      );
    };

    const singlePinStyle = (
      bridgeFeature: FeatureLike,
      hovered: boolean,
      selected = isSelected(bridgeFeature)
    ) =>
      getPinStyle(
        (bridgeFeature.get('iconSrc') as string | undefined) ?? iconSrc,
        (bridgeFeature.get('zIndex') as number | undefined) ?? 0,
        selected,
        hovered
      );

    // For draggable pins (new bridge marker), don't use clustering
    if (draggable) {
      const layer = new OLVectorLayer({
        source: vectorSource,
        style: (feature) =>
          singlePinStyle(feature, feature.get('hovered') === true, false),
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
          store.reportBridge.setManualPosition(true);
          store.reportBridge.setManualEntryPending(false);
          store.reportBridge
            .setPosition(createLatLon(lonLat[1], lonLat[0]), 'drag')
            .then(() => {
              store.mapSettings.setCenter(point);
            });
        });
        store.mapSettings.setZoom(17);
      });
      mapContext.addInteraction(interaction);

      return () => {
        mapContext.removeLayer(layer);
        mapContext.removeInteraction(interaction);
      };
    }

    if (!clustered) {
      const layer = new OLVectorLayer({
        source: vectorSource,
        style: (feature) =>
          singlePinStyle(feature, feature.get('hovered') === true),
        zIndex,
      });
      layerRef.current = layer;
      mapContext.addLayer(layer);
      return () => {
        mapContext.removeLayer(layer);
        layerRef.current = null;
      };
    }

    const view = mapContext.getView();
    const initialDistance = getClusterDistance(view.getZoom() ?? 9);
    const clusterSource = new Cluster({
      distance: initialDistance,
      // OpenLayers caps minDistance at the current distance, so this keeps
      // cluster centers at least `distance` apart at every zoom level, which
      // (see DISTANCE_MIN) is enough to prevent bubbles from overlapping
      minDistance: CLUSTER_CONFIG.DISTANCE_BASE,
      source: vectorSource,
    });

    const clusterStyleFunction: StyleFunction = (feature) => {
      const members = feature.get('features') as Feature<Geometry>[];
      const hovered = feature.get('hovered') === true;
      const clusteringDisabledByZoom =
        (view.getZoom() ?? 9) >= CLUSTER_CONFIG.ZOOM_THRESHOLD_DISABLE;

      // Single bridge, or bridges at the same position at high zoom: show the
      // pin of the highest-risk member (click opens the overlap picker)
      if (members.length === 1 || clusteringDisabledByZoom) {
        const top = members.reduce((a, b) =>
          ((b.get('zIndex') as number) ?? 0) >
          ((a.get('zIndex') as number) ?? 0)
            ? b
            : a
        );
        return singlePinStyle(
          top,
          hovered,
          members.some((m) => isSelected(m))
        );
      }

      return getClusterStyle(members.length, hovered);
    };

    const layer = new OLVectorLayer({
      source: clusterSource,
      style: clusterStyleFunction,
      zIndex,
    });
    layerRef.current = layer;
    mapContext.addLayer(layer);

    let wasClusteringDisabled = initialDistance === 0;
    const onZoomChange = () => {
      const distance = getClusterDistance(view.getZoom() ?? 9);
      clusterSource.setDistance(distance);

      // Force style refresh when crossing the zoom threshold
      const isClusteringDisabled = distance === 0;
      if (isClusteringDisabled !== wasClusteringDisabled) {
        wasClusteringDisabled = isClusteringDisabled;
        layer.changed();
      }
    };
    view.on('change:resolution', onZoomChange);

    return () => {
      view.un('change:resolution', onZoomChange);
      mapContext.removeLayer(layer);
      layerRef.current = null;
    };
    // `features` is memoized by the caller, so a new array means new data
  }, [mapContext, features, clustered, draggable, iconSrc, zIndex]);

  return <></>;
};

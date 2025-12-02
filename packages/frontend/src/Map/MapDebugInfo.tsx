import type { FC } from 'react';

import { RotateCcw } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';

import { resetHowToSeen } from '../components/HowToModal';
import { resetWelcomeSeen } from '../components/WelcomeModal';
import { MapContext } from './MapContext';

/**
 * Debug info panel that displays map state information.
 * Only visible in development mode.
 */
export const MapDebugInfo: FC = () => {
  const mapContext = useContext(MapContext);
  const [zoom, setZoom] = useState<number>(0);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [resolution, setResolution] = useState<number>(0);
  const [clusterDistance, setClusterDistance] = useState<number>(0);

  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  useEffect(() => {
    if (!mapContext) return;

    const updateDebugInfo = () => {
      const view = mapContext.getView();
      const currentZoom = view.getZoom() ?? 0;
      const currentCenter = view.getCenter() as [number, number] | undefined;
      const currentResolution = view.getResolution() ?? 0;

      setZoom(currentZoom);
      setCenter(currentCenter ?? [0, 0]);
      setResolution(currentResolution);

      // Calculate cluster distance based on zoom
      const ZOOM_THRESHOLD_LOW = 8;
      const ZOOM_THRESHOLD_HIGH = 14;
      const DISTANCE_BASE = 60;
      const DISTANCE_MIN = 25;

      let distance: number;
      if (currentZoom <= ZOOM_THRESHOLD_LOW) {
        distance = DISTANCE_BASE;
      } else if (currentZoom >= ZOOM_THRESHOLD_HIGH) {
        distance = DISTANCE_MIN;
      } else {
        const ratio =
          (currentZoom - ZOOM_THRESHOLD_LOW) /
          (ZOOM_THRESHOLD_HIGH - ZOOM_THRESHOLD_LOW);
        distance = DISTANCE_BASE - ratio * (DISTANCE_BASE - DISTANCE_MIN);
      }
      setClusterDistance(Math.round(distance));
    };

    // Initial update
    updateDebugInfo();

    // Listen for view changes
    mapContext.getView().on('change:resolution', updateDebugInfo);
    mapContext.getView().on('change:center', updateDebugInfo);

    return () => {
      mapContext.getView().un('change:resolution', updateDebugInfo);
      mapContext.getView().un('change:center', updateDebugInfo);
    };
  }, [mapContext]);

  const handleResetState = () => {
    resetWelcomeSeen();
    resetHowToSeen();
    window.location.reload();
  };

  if (!mapContext) return null;

  return (
    <div className="absolute bottom-4 left-4 z-20 select-none rounded bg-black/70 p-2 font-mono text-xs text-white shadow-lg">
      <div className="mb-1 font-bold text-yellow-300">Debug Info</div>
      <div>Zoom: {zoom.toFixed(2)}</div>
      <div>Resolution: {resolution.toFixed(2)} m/px</div>
      <div>Cluster Distance: {clusterDistance}px</div>
      <div className="mt-1 text-gray-400">
        Center: [{center[0].toFixed(0)}, {center[1].toFixed(0)}]
      </div>
      <button
        className="pointer-events-auto mt-2 flex items-center gap-1 text-yellow-300 hover:text-yellow-100"
        onClick={handleResetState}
        title="Reset persisted state (welcome modal)"
      >
        <RotateCcw className="h-3 w-3" />
        Reset State
      </button>
    </div>
  );
};

import type { LatLon } from './LatLon';

import { createLatLon } from './LatLon';

/**
 * Default pin position (centre of Switzerland, near Sachseln OW) when GPS is
 * unavailable. Never a valid bridge position: the backend rejects it as well,
 * see packages/backend/src/parse/cloud/lib/bridge-verify-position.ts.
 */
export const FALLBACK_LAT_LON = createLatLon(46.79871, 8.23176);

/** No watercourse lies within this distance of the fallback point */
const FALLBACK_RADIUS_M = 100;

/** True if the position is (still) on or right next to the fallback point */
export function isNearFallback(latLon: LatLon): boolean {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(latLon.lat - FALLBACK_LAT_LON.lat);
  const dLon = toRad(latLon.lon - FALLBACK_LAT_LON.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(FALLBACK_LAT_LON.lat)) *
      Math.cos(toRad(latLon.lat)) *
      Math.sin(dLon / 2) ** 2;
  const distanceM = 2 * 6371000 * Math.asin(Math.sqrt(a));
  return distanceM < FALLBACK_RADIUS_M;
}

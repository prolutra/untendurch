import type { Lv95 } from './Lv95';

import { transformToLv95 } from '../GeoAdmin/projections';

export interface LatLon {
  lat: number;
  lon: number;
}

export function createLatLon(lat: number, lon: number): LatLon {
  return { lat, lon };
}

export function getAsLv95(latLon: LatLon): Lv95 {
  return transformToLv95(latLon.lon, latLon.lat);
}

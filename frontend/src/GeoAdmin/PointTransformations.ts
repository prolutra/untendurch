import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { LatLon } from '../Store/LatLon';

export function latLonToPoint(latLon: LatLon): Point {
  return new Point(fromLonLat([latLon.lon, latLon.lat]));
}

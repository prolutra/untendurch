import type { LatLon } from '../Store/LatLon';

import { transformFromLv95 } from './projections';

export type CoordinateFormat = 'LV03' | 'LV95' | 'WGS84';

export type ParseCoordinatesResult =
  | { error: 'invalid' | 'outside_switzerland'; ok: false }
  | { format: CoordinateFormat; latLon: LatLon; ok: true };

type Range = [number, number];

// Generous bounding boxes around Switzerland (incl. Liechtenstein)
const LV95_EAST: Range = [2_480_000, 2_840_000];
const LV95_NORTH: Range = [1_070_000, 1_300_000];
const LV03_EAST: Range = [480_000, 840_000];
const LV03_NORTH: Range = [70_000, 300_000];
const WGS84_LAT: Range = [45.8, 47.9];
const WGS84_LON: Range = [5.9, 10.6];

const inRange = (value: number, [min, max]: Range) =>
  value >= min && value <= max;

/**
 * Parses free text coordinates as typed or copied from map.geo.admin.ch,
 * Google Maps etc. Supported formats (auto-detected by magnitude):
 * - LV95, e.g. "2'600'000, 1'200'000"
 * - LV03, e.g. "600000 / 200000"
 * - WGS84 decimal degrees, e.g. "46.9480, 7.4474" or "46,9480 7,4474"
 * Swapped axis order is detected and corrected.
 */
export function parseCoordinates(input: string): ParseCoordinatesResult {
  // Strip thousands separators used in Swiss notation
  let normalized = input.replace(/['’ʼ`]/g, '').trim();

  // Degree/minute notation is not supported
  if (/[°"]/.test(normalized)) return { error: 'invalid', ok: false };

  // Decimal commas, e.g. "46,948 7,447"
  if (/^-?\d+,\d+[\s;/]+-?\d+,\d+$/.test(normalized)) {
    normalized = normalized.replace(/(\d),(\d)/g, '$1.$2');
  }

  const numbers = normalized.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (numbers.length !== 2 || numbers.some((n) => !Number.isFinite(n))) {
    return { error: 'invalid', ok: false };
  }
  const [a, b] = numbers;
  const smallest = Math.min(Math.abs(a), Math.abs(b));
  const largest = Math.max(Math.abs(a), Math.abs(b));

  if (smallest >= 1_000_000) {
    const pair = orderPair(a, b, LV95_EAST, LV95_NORTH);
    if (!pair) return { error: 'outside_switzerland', ok: false };
    return { format: 'LV95', latLon: transformFromLv95(...pair), ok: true };
  }

  if (smallest >= 10_000 && largest < 1_000_000) {
    const pair = orderPair(a, b, LV03_EAST, LV03_NORTH);
    if (!pair) return { error: 'outside_switzerland', ok: false };
    // LV95 = LV03 + fixed false easting/northing offset
    return {
      format: 'LV03',
      latLon: transformFromLv95(pair[0] + 2_000_000, pair[1] + 1_000_000),
      ok: true,
    };
  }

  if (largest <= 180) {
    const pair = orderPair(a, b, WGS84_LAT, WGS84_LON);
    if (!pair) return { error: 'outside_switzerland', ok: false };
    return {
      format: 'WGS84',
      latLon: { lat: pair[0], lon: pair[1] },
      ok: true,
    };
  }

  return { error: 'invalid', ok: false };
}

/**
 * Orders a pair of numbers as [x, y] given the expected ranges, detecting
 * swapped input. Returns null if neither order fits.
 */
function orderPair(
  a: number,
  b: number,
  xRange: Range,
  yRange: Range
): [number, number] | null {
  if (inRange(a, xRange) && inRange(b, yRange)) return [a, b];
  if (inRange(b, xRange) && inRange(a, yRange)) return [b, a];
  return null;
}

import type { Point } from 'ol/geom';
import type { IdentityResponse } from './IdentityResponse';
import type { IdentityResultEntries } from './IdentityResultEntries';
import type { MunicipalityResultEntry } from './MunicipalityResultEntry';
import type { PointInformation } from './PointInformation';
import type { TrafficResultEntry } from './TrafficResultEntry';
import type { WaterBodiesResultEntry } from './WaterBodiesResultEntry';
import type { LayerBodIdType } from './LayerBodIdType';

async function fetchAdditionalInformation<T>(
  point: Point,
  urlType: 'api' | 'all',
  layer: LayerBodIdType,
  tolerance = 0
): Promise<T[]> {
  const x = point.getCoordinates()[0];
  const y = point.getCoordinates()[1];
  const imageDisplay =
    tolerance === 0 ? 'imageDisplay=0,0,0' : 'imageDisplay=1000,1000,92';
  const mapExtent =
    tolerance === 0
      ? 'mapExtent=0,0,0,0'
      : `mapExtent=${x - 1000},${y - 1000},${x + 1000},${y + 1000}`;

  const url = `https://api3.geo.admin.ch/rest/services/${urlType}/MapServer/identify?geometry=${x},${y}&geometryFormat=geojson&geometryType=esriGeometryPoint&sr=3857&${imageDisplay}&${mapExtent}&tolerance=${tolerance}&lang=de&layers=all:${layer}&returnGeometry=false`;

  return fetch(url)
    .then((result) => result.json())
    .then((result: IdentityResponse<IdentityResultEntries<T>>) => {
      const entries = Array.of<T>();
      result.results.forEach((result) => {
        const entry = result.attributes || result.properties;
        if (entry) {
          entries.push(entry);
        }
      });
      return entries;
    });
}

async function fetchWaterBodiesInformation(
  point: Point
): Promise<WaterBodiesResultEntry[]> {
  return fetchAdditionalInformation<WaterBodiesResultEntry>(
    point,
    'all',
    'ch.swisstopo.swisstlm3d-gewaessernetz',
    20
  );
}

async function fetchTrafficInformation(
  point: Point
): Promise<TrafficResultEntry[]> {
  return fetchAdditionalInformation<TrafficResultEntry>(
    point,
    'all',
    'ch.are.belastung-personenverkehr-strasse',
    10
  );
}

async function fetchPointMunicipalityInformation(
  point: Point
): Promise<MunicipalityResultEntry[]> {
  return fetchAdditionalInformation<MunicipalityResultEntry>(
    point,
    'api',
    'ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill',
    0
  );
}

async function fetchPointInformationInternal(
  point: Point
): Promise<PointInformation> {
  const [municipalityResultAttributes, waterBodies, trafficInformation] =
    await Promise.all([
      fetchPointMunicipalityInformation(point),
      fetchWaterBodiesInformation(point),
      fetchTrafficInformation(point),
    ]);

  return {
    canton: municipalityResultAttributes[0]?.kanton ?? '',
    municipality: municipalityResultAttributes[0]?.gemname ?? '',
    waterBodies: waterBodies
      .filter((w) => w.objektart === 4)
      .map((w) => w.name)
      .filter((value, index, self) => self.indexOf(value) === index),
    averageDailyTraffic:
      trafficInformation.length > 0 ? trafficInformation[0].dtv_fzg : undefined,
  };
}

// Debounced version to prevent API hammering during pin dragging
const DEBOUNCE_MS = 300;

let pendingResolve: ((value: PointInformation) => void) | null = null;
let pendingReject: ((reason: unknown) => void) | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedFetch(point: Point) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(async () => {
    try {
      const result = await fetchPointInformationInternal(point);
      if (pendingResolve) {
        pendingResolve(result);
      }
    } catch (error) {
      if (pendingReject) {
        pendingReject(error);
      }
    } finally {
      pendingResolve = null;
      pendingReject = null;
    }
  }, DEBOUNCE_MS);
}

export function fetchPointInformation(point: Point): Promise<PointInformation> {
  return new Promise((resolve, reject) => {
    pendingResolve = resolve;
    pendingReject = reject;
    debouncedFetch(point);
  });
}

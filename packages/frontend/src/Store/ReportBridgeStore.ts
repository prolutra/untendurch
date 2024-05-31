import { computed } from 'mobx';
import { model, Model, modelAction, prop } from 'mobx-keystone';
import { Feature } from 'ol';
import type { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import type { LatLon } from './LatLon';
import { fetchPointInformation } from '../GeoAdmin/FetchPointInformation';
import type { Lv95 } from './Lv95';
import proj4 from 'proj4';
import { latLonToPoint } from '../GeoAdmin/PointTransformations';

@model('untendurch/ReportBridgeRoute')
export class ReportBridgeStore extends Model({
  latLon: prop<LatLon | null>(() => null).withSetter(),
  canton: prop<string>(() => '').withSetter(),
  municipality: prop<string>(() => '').withSetter(),
}) {
  @computed
  get reportedFeature(): Feature<Point> | null {
    if (this.latLon) {
      const feature = new Feature({
        geometry: latLonToPoint(this.latLon),
      });
      feature.setId('reportedFeature-' + new Date());
      return feature;
    } else {
      return null;
    }
  }

  @modelAction
  async setPosition(latLon: LatLon) {
    return fetchPointInformation(latLonToPoint(latLon)).then((result) => {
      this.setLatLon(latLon);
      this.setCanton(result.canton);
      this.setMunicipality(result.municipality);
    });
  }

  @computed
  get asLv95(): Lv95 | null {
    if (this.latLon) {
      const result = proj4(
        'PROJCS["WGS 84 / Pseudo-Mercator",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]],PROJECTION["Mercator_1SP"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["X",EAST],AXIS["Y",NORTH],EXTENSION["PROJ4","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"],AUTHORITY["EPSG","3857"]]',
        'PROJCS["CH1903+ / LV95", GEOGCS["CH1903+", DATUM["CH1903+", SPHEROID["Bessel 1841", 6377397.155, 299.1528128, AUTHORITY["EPSG","7004"]], TOWGS84[674.374, 15.056, 405.346, 0.0, 0.0, 0.0, 0.0], AUTHORITY["EPSG","6150"]], PRIMEM["Greenwich", 0.0, AUTHORITY["EPSG","8901"]], UNIT["degree", 0.017453292519943295], AXIS["Geodetic longitude", EAST], AXIS["Geodetic latitude", NORTH], AUTHORITY["EPSG","4150"]], PROJECTION["Oblique_Mercator", AUTHORITY["EPSG","9815"]], PARAMETER["longitude_of_center", 7.439583333333333], PARAMETER["latitude_of_center", 46.952405555555565], PARAMETER["azimuth", 90.0], PARAMETER["scale_factor", 1.0], PARAMETER["false_easting", 2600000.0], PARAMETER["false_northing", 1200000.0], PARAMETER["rectified_grid_angle", 90.0], UNIT["m", 1.0], AXIS["Easting", EAST], AXIS["Northing", NORTH], AUTHORITY["EPSG","2056"]]',
        fromLonLat([this.latLon.lon, this.latLon.lat])
      );
      return {
        east: result[0],
        west: result[1],
      };
    } else {
      return null;
    }
  }
}

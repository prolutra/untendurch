import type { FC } from 'react';

import * as ol from 'ol';
import { Feature } from 'ol';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import { Icon, Style } from 'ol/style';
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { LatLon } from '../Store/LatLon';

import { latLonToPoint } from '../GeoAdmin/PointTransformations';

type Props = {
  latLon: LatLon;
};

const tileUrl = (layer: string) =>
  `https://wmts.geo.admin.ch/1.0.0/${layer}/default/current/3857/{z}/{x}/{y}.jpeg`;

/**
 * Read-only map showing a single pin, used to visually verify a position
 * before saving. Defaults to aerial imagery so the bridge itself is visible.
 */
export const PositionPreviewMap: FC<Props> = ({ latLon }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [aerial, setAerial] = useState(true);
  const aerialLayerRef = useRef<null | TileLayer<XYZ>>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const point = latLonToPoint(latLon);
    const attributions =
      '&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>';

    const aerialLayer = new TileLayer({
      source: new XYZ({
        attributions,
        url: tileUrl('ch.swisstopo.swissimage'),
      }),
    });
    aerialLayerRef.current = aerialLayer;

    const map = new ol.Map({
      controls: defaultControls().extend([new ScaleLine({ units: 'metric' })]),
      layers: [
        new TileLayer({
          source: new XYZ({
            attributions,
            url: tileUrl('ch.swisstopo.pixelkarte-farbe'),
          }),
        }),
        aerialLayer,
        new VectorLayer({
          source: new VectorSource({
            features: [new Feature({ geometry: point })],
          }),
          style: new Style({
            image: new Icon({
              anchor: [0.5, 1],
              scale: 0.6,
              src: '/bridge_pin_new.svg',
            }),
          }),
        }),
      ],
      target: mapRef.current,
      view: new ol.View({
        center: point.getCoordinates(),
        maxZoom: 19,
        minZoom: 8.5,
        projection: 'EPSG:3857',
        zoom: 17,
      }),
    });

    return () => map.setTarget(undefined);
  }, [latLon.lat, latLon.lon]);

  useEffect(() => {
    aerialLayerRef.current?.setVisible(aerial);
  }, [aerial]);

  return (
    <div className={'relative'}>
      <div
        className={'h-[250px] w-full overflow-hidden rounded-lg'}
        ref={mapRef}
      />
      <button
        className={'btn btn-xs absolute right-2 top-2 z-10'}
        onClick={() => setAerial((a) => !a)}
        type={'button'}
      >
        {aerial ? (
          <FormattedMessage
            defaultMessage={'Karte'}
            id="position_preview_map_show_map"
          />
        ) : (
          <FormattedMessage
            defaultMessage={'Luftbild'}
            id="position_preview_map_show_aerial"
          />
        )}
      </button>
    </div>
  );
};

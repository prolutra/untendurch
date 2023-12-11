import type { FC } from 'react';
import { useContext, useEffect } from 'react';
import MapContext from '../Map/MapContext';
import OLTileLayer from 'ol/layer/Tile';
import { XYZ } from 'ol/source';

type TileLayerProps = {
  zIndex: number;
};

const TileLayer: FC<TileLayerProps> = ({ zIndex = 0 }) => {
  const mapContext = useContext(MapContext);

  useEffect(() => {
    if (!mapContext) return;

    const source = new XYZ({
      url: `https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg`,
    });

    const layer = new OLTileLayer({
      source,
      zIndex,
    });

    mapContext.addLayer(layer);
    layer.setZIndex(zIndex);

    return () => {
      if (mapContext) {
        mapContext.removeLayer(layer);
      }
    };
  }, [mapContext]);

  return null;
};

export default TileLayer;

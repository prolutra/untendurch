import { useContext, useEffect } from 'react';
import MapContext from '../Map/MapContext';
import OLTileLayer from 'ol/layer/Tile';
import { XYZ } from 'ol/source';

export interface TileLayerProps {
  zIndex: number;
}

const TileLayer = ({ zIndex = 0 }: TileLayerProps) => {
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

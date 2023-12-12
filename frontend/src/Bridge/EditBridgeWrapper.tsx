import type { GeoPoint } from 'parse';
import Parse from 'parse';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useStore } from '../Store/Store';
import { LatLon } from '../Store/LatLon';
import type { BridgeFormState, PersistedFile } from './BridgeFormState';
import { latLonToPoint } from '../GeoAdmin/PointTransformations';
import type { BridgeLogItem } from '../Store/BridgeSchema';
import { BridgeForm } from './BridgeForm';

export const EditBridgeWrapper: FC = () => {
  const store = useStore();

  const { id } = useParams();

  const [state, setState] = useState<BridgeFormState>();

  useEffect(() => {
    if (!id) return;

    const query = new Parse.Query('Bridge');
    query.get(id).then((bridge) => {
      const name = bridge.attributes['name'] as string;
      const position = bridge.attributes['position'] as GeoPoint;
      const hasBanquet = bridge.attributes['hasBanquet'] as boolean;
      const hasMinimalBanquetWidth = bridge.attributes['hasBanquet'] as boolean;
      const hasStones = bridge.attributes['hasStones'] as boolean;
      const bridgeWidth = bridge.attributes['bridgeWidth'] as number;
      const bridgeHeight = bridge.attributes['bridgeHeight'] as number;
      const bridgeLength = bridge.attributes['bridgeLength'] as number;
      const hasContinuousShore = bridge.attributes[
        'hasContinuousShore'
      ] as boolean;
      const hasSlopes = bridge.attributes['hasSlopes'] as boolean;
      const traffic = bridge.attributes['traffic'] as string;
      const speedLimit = bridge.attributes['speedLimit'] as string;
      const barriers = bridge.attributes['barriers'] as string;
      const commentReporter = bridge.attributes['commentReporter'] as string;
      const commentAdmin = bridge.attributes['commentAdmin'] as string;
      const nickname = bridge.attributes['nickname'] as string;
      const email = bridge.attributes['email'] as string;
      const shape = bridge.attributes['shape'] as string;
      const cantons = bridge.attributes['cantons'] as string[];
      const municipalities = bridge.attributes['municipalities'] as string[];
      const itemLog = bridge.attributes['itemLog'] as BridgeLogItem[];
      const images = bridge.attributes['images'] as PersistedFile[];

      store.reportBridge.setPosition(
        new LatLon({
          lat: position.latitude,
          lon: position.longitude,
        })
      );

      setState({
        objectId: id,
        name: name,
        shape: shape,
        hasBanquet: hasBanquet,
        hasMinimalBanquetWidth: hasMinimalBanquetWidth,
        hasStones: hasStones,
        bridgeWidth: bridgeWidth,
        bridgeHeight: bridgeHeight,
        bridgeLength: bridgeLength,
        hasContinuousShore: hasContinuousShore,
        hasSlopes: hasSlopes,
        traffic: traffic,
        speedLimit: speedLimit,
        barriers: barriers,
        nickname: nickname,
        email: email,
        commentReporter: commentReporter,
        commentAdmin: commentAdmin,
        images: images,
        cantons: cantons.join(', '),
        municipalities: municipalities.join(', '),
        itemLog,
      } as BridgeFormState);

      store.mapSettings.setCenter(
        latLonToPoint(
          new LatLon({ lat: position.latitude, lon: position.longitude })
        ).getCoordinates()
      );
      store.mapSettings.setZoom(17);
      store.mapSettings.setMode('TOP');
    });
  }, [id]);

  if (!state) return null;

  return <BridgeForm bridgeFormState={state}></BridgeForm>;
};

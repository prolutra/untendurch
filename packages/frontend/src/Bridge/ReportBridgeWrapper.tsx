import type { FC } from 'react';
import { useEffect } from 'react';

import { useStore } from '../Store/Store';
import { observer } from 'mobx-react-lite';
import { LatLon } from '../Store/LatLon';
import type { BridgeFormState } from './BridgeFormState';
import { BridgeForm } from './BridgeForm';

export const ReportBridgeWrapper: FC = observer(() => {
  const store = useStore();

  const defaultState: BridgeFormState = {
    objectId: '',
    name: '',
    shape: '',
    bridgeWidth: 0,
    bridgeHeight: 0,
    bridgeLength: 0,
    nickname: '',
    email: '',
    itemLog: [],
    commentReporter: '',
    commentAdmin: '',
    hasBanquet: false,
    hasMinimalBanquetWidth: false,
    hasStones: false,
    hasContinuousShore: false,
    hasSlopes: false,
    traffic: 'MEDIUM_TRAFFIC',
    speedLimit: '40_50',
    barriers: 'NONE',
    images: [],
    cantons: '',
    municipalities: '',
  };

  useEffect(() => {
    store.mapSettings.setMode('TOP');
    store.currentPosition.locateMe();
  }, []);

  useEffect(() => {
    if (store.currentPosition.latLon) {
      store.reportBridge
        .setPosition(
          new LatLon({
            lat: store.currentPosition.latLon.lat,
            lon: store.currentPosition.latLon.lon,
          })
        )
        .then(() => {
          if (store.currentPosition.currentPoint) {
            store.mapSettings.setCenter(
              store.currentPosition.currentPoint.getCoordinates()
            );
            store.mapSettings.setZoom(17);
          }
        });
    }
  }, [store.currentPosition.latLon]);

  useEffect(() => {
    if (store.currentPosition.navigatorWithoutLocationSupport) {
      store.reportBridge.setPosition(
        new LatLon({
          lat: 46.79871,
          lon: 8.23176,
        })
      );
    }
  }, [store.currentPosition.navigatorWithoutLocationSupport]);

  return <BridgeForm bridgeFormState={defaultState}></BridgeForm>;
});

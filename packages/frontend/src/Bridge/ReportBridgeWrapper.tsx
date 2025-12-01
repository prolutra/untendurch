import type { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import type { BridgeFormState } from './BridgeFormState';

import { LatLon } from '../Store/LatLon';
import { useStore } from '../Store/Store';
import { BridgeForm } from './BridgeForm';

export const ReportBridgeWrapper: FC = observer(() => {
  const store = useStore();

  const defaultState: BridgeFormState = {
    barriers: 'NONE',
    bridgeHeight: 0,
    bridgeLength: 0,
    bridgeWidth: 0,
    cantons: '',
    commentAdmin: '',
    commentReporter: '',
    email: '',
    hasBanquet: false,
    hasContinuousShore: false,
    hasMinimalBanquetWidth: false,
    hasSlopes: false,
    hasStones: false,
    images: [],
    itemLog: [],
    municipalities: '',
    name: '',
    nickname: '',
    objectId: '',
    shape: '',
    speedLimit: '40_50',
    traffic: 'MEDIUM_TRAFFIC',
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

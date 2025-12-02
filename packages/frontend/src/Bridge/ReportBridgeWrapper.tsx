import type { FC } from 'react';

import { useEffect, useState } from 'react';

import type { BridgeFormState } from './BridgeFormState';

import { HowToModal } from '../components/HowToModal';
import { createLatLon } from '../Store/LatLon';
import { useReportMapStore } from '../Store/ReportMapStore';
import { useStore } from '../Store/Store';
import { BridgeForm } from './BridgeForm';

export const ReportBridgeWrapper: FC = () => {
  const store = useStore();
  const [showHowTo, setShowHowTo] = useState(false);

  // Use the isolated report map store (no localStorage persistence)
  const setReportMapCenter = useReportMapStore((s) => s.setCenter);
  const setReportMapZoom = useReportMapStore((s) => s.setZoom);
  const resetReportMap = useReportMapStore((s) => s.reset);

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

  // Reset report map state on mount and start geolocation
  useEffect(() => {
    resetReportMap();
    store.currentPosition.locateMe();
  }, []);

  // When user location is acquired, center the report map (not the main map)
  useEffect(() => {
    if (store.currentPosition.latLon) {
      store.reportBridge
        .setPosition(
          createLatLon(
            store.currentPosition.latLon.lat,
            store.currentPosition.latLon.lon
          )
        )
        .then(() => {
          const currentPoint = store.currentPosition.currentPoint();
          if (currentPoint) {
            // Update the report map store, not the main map store
            setReportMapCenter(currentPoint.getCoordinates());
            setReportMapZoom(17);
          }
        });
    }
  }, [store.currentPosition.latLon]);

  // Fallback if geolocation not supported
  useEffect(() => {
    if (store.currentPosition.navigatorWithoutLocationSupport) {
      store.reportBridge.setPosition(createLatLon(46.79871, 8.23176));
    }
  }, [store.currentPosition.navigatorWithoutLocationSupport]);

  return (
    <>
      <HowToModal forceOpen={showHowTo} onClose={() => setShowHowTo(false)} />
      <BridgeForm
        bridgeFormState={defaultState}
        onShowHowTo={() => setShowHowTo(true)}
      />
    </>
  );
};

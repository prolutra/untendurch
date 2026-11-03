import 'ol/ol.css';

import type { FC } from 'react';

import React, { useEffect } from 'react';

import { Layout } from '../Layout';
import { MapWrapper } from '../Map/MapWrapper';
import { ReviewMapLock } from '../Map/ReviewMapLock';
import { useStore } from '../Store/Store';
import { EditBridgeWrapper } from './EditBridgeWrapper';

export const EditBridgeRoute: FC = () => {
  const store = useStore();

  useEffect(() => {
    // Save main map state before entering edit bridge view
    store.mapSettings.saveMainMapState();
    // Clear any selected bridge pin when entering the edit bridge page
    store.mapSettings.setSelectedBridgePinObjectId(null);
  }, []);

  return (
    <Layout>
      <ReviewMapLock>
        <MapWrapper variant={'small'}></MapWrapper>
      </ReviewMapLock>
      <div className={'pt-8'}>
        <EditBridgeWrapper></EditBridgeWrapper>
      </div>
    </Layout>
  );
};

import 'ol/ol.css';

import type { FC } from 'react';

import React, { useEffect } from 'react';

import { Layout } from '../Layout';
import { MapWrapper } from '../Map/MapWrapper';
import { useStore } from '../Store/Store';
import { EditBridgeWrapper } from './EditBridgeWrapper';

export const EditBridgeRoute: FC = () => {
  const store = useStore();

  useEffect(() => {
    // Clear any selected bridge pin when entering the edit bridge page
    store.mapSettings.setSelectedBridgePinObjectId(null);
  }, []);

  return (
    <Layout>
      <MapWrapper variant={'small'}></MapWrapper>
      <div className={'pt-8'}>
        <EditBridgeWrapper></EditBridgeWrapper>
      </div>
    </Layout>
  );
};

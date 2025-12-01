import type { FC } from 'react';

import React, { useEffect } from 'react';

import { Layout } from '../Layout';
import { MapWrapper } from '../Map/MapWrapper';
import { useStore } from '../Store/Store';
import { ReportBridgeWrapper } from './ReportBridgeWrapper';

export const ReportBridgeRoute: FC = () => {
  const store = useStore();

  useEffect(() => {
    // Save main map state before entering report bridge view
    store.mapSettings.saveMainMapState();
    // Clear any selected bridge pin when entering the report bridge page
    store.mapSettings.setSelectedBridgePinObjectId(null);
  }, []);

  return (
    <Layout>
      <MapWrapper variant={'small'}></MapWrapper>
      <div className={'pt-8'}>
        <ReportBridgeWrapper></ReportBridgeWrapper>
      </div>
    </Layout>
  );
};

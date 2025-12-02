import type { FC } from 'react';

import React, { useEffect } from 'react';

import { Layout } from '../Layout';
import { ReportMapWrapper } from '../Map/ReportMapWrapper';
import { useStore } from '../Store/Store';
import { ReportBridgeWrapper } from './ReportBridgeWrapper';

export const ReportBridgeRoute: FC = () => {
  const store = useStore();

  useEffect(() => {
    // Clear any selected bridge pin when entering the report bridge page
    store.mapSettings.setSelectedBridgePinObjectId(null);
  }, []);

  return (
    <Layout>
      <ReportMapWrapper />
      <div className={'pt-8'}>
        <ReportBridgeWrapper></ReportBridgeWrapper>
      </div>
    </Layout>
  );
};

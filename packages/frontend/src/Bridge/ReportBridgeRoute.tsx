import type { FC } from 'react';
import React from 'react';
import { ReportBridgeWrapper } from './ReportBridgeWrapper';
import { MapWrapper } from '../Map/MapWrapper';
import { Layout } from '../Layout';

export const ReportBridgeRoute: FC = () => {
  return (
    <Layout>
      <MapWrapper variant={'small'}></MapWrapper>
      <div className={'pt-8'}>
        <ReportBridgeWrapper></ReportBridgeWrapper>
      </div>
    </Layout>
  );
};

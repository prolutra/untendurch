import 'ol/ol.css';

import type { FC } from 'react';
import React from 'react';
import { MapWrapper } from '../Map/MapWrapper';
import { Layout } from '../Layout';
import { EditBridgeWrapper } from './EditBridgeWrapper';

export const EditBridgeRoute: FC = () => {
  return (
    <Layout>
      <MapWrapper variant={'small'}></MapWrapper>
      <div className={'pt-8'}>
        <EditBridgeWrapper></EditBridgeWrapper>
      </div>
    </Layout>
  );
};

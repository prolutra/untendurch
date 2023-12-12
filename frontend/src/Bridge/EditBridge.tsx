import 'ol/ol.css';

import type { FC } from 'react';
import React from 'react';
import EditBridgeWrapper from './EditBridgeWrapper';

const EditBridge: FC = () => {
  return (
    <div className="EditBridge">
      <EditBridgeWrapper></EditBridgeWrapper>
    </div>
  );
};

export default EditBridge;

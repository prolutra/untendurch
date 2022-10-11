import React from 'react';
import { observer } from 'mobx-react-lite';
import { ReportBridgeStore } from '../Store/ReportBridgeStore';

import { Flex, Input } from 'theme-ui';

interface PositionInformationProps {
  reportedBridge: ReportBridgeStore;
}

const PositionInformation = observer(
  ({ reportedBridge }: PositionInformationProps) => {
    return (
      <Flex sx={{ gap: 1 }}>
        <Input
          sx={{
            flex: ['1 60%', '1 60%', '1 100%', '1 100%'],
            marginRight: '2',
          }}
          name="position"
          disabled={true}
          readOnly={true}
          placeholder={
            reportedBridge.latLon
              ? reportedBridge.latLon.asLv95.east.toFixed(2) +
                ', ' +
                reportedBridge.latLon.asLv95.west.toFixed(2)
              : ''
          }
        ></Input>
        <Input
          sx={{ flex: ['1 13%', '1 13%', '1 20%', '1 20%'] }}
          name="canton"
          disabled={true}
          readOnly={true}
          placeholder={reportedBridge.canton}
        ></Input>
        <Input
          sx={{ flex: ['1 37%', '1 37%', '1 100%', '1 100%'] }}
          name="municipality"
          disabled={true}
          readOnly={true}
          placeholder={reportedBridge.municipality}
        ></Input>
      </Flex>
    );
  }
);

export default PositionInformation;

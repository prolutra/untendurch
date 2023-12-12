import type { FC } from 'react';
import React from 'react';
import { observer } from 'mobx-react-lite';
import type { ReportBridgeStore } from '../Store/ReportBridgeStore';

import { Box, Flex, Input, Label } from 'theme-ui';
import { FormattedMessage } from 'react-intl';

type PositionInformationProps = {
  reportedBridge: ReportBridgeStore;
};

const PositionInformation: FC<PositionInformationProps> = observer(
  ({ reportedBridge }) => {
    return (
      <Flex sx={{ gap: 1, alignItems: 'flex-end' }}>
        <Box>
          <Label htmlFor="position" className="disabledLabel">
            <FormattedMessage
              id="report_bridge_label_position"
              defaultMessage={'Position'}
            />
          </Label>
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
          ></Input>{' '}
        </Box>

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

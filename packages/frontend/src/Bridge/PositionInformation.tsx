import type { FC } from 'react';

import { observer } from 'mobx-react-lite';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import type { ReportBridgeStore } from '../Store/ReportBridgeStore';

import { LocateMe } from '../Location/LocateMe';

type PositionInformationProps = {
  reportedBridge: ReportBridgeStore;
};

export const PositionInformation: FC<PositionInformationProps> = observer(
  ({ reportedBridge }) => {
    if (!reportedBridge.latLon) {
      return (
        <div className={'flex flex-row items-center gap-4'}>
          <LocateMe />
          <div>
            <FormattedMessage
              defaultMessage={
                'Benutzen Sie die GPS-Funktion Ihres Geräts um die aktuelle Position zu bestimmen.'
              }
              id="report_bridge_no_position"
            />
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col md:flex-row gap-1 md:items-end justify-stretch">
        <div>
          <label className="label" htmlFor="position">
            <FormattedMessage
              defaultMessage={'Position'}
              id="report_bridge_label_position"
            />
          </label>
          <input
            className="input input-bordered"
            disabled={true}
            name="position"
            placeholder={
              reportedBridge.latLon
                ? reportedBridge.latLon.asLv95.east.toFixed(2) +
                  ', ' +
                  reportedBridge.latLon.asLv95.west.toFixed(2)
                : ''
            }
            readOnly={true}
          />
        </div>

        <input
          className="input input-bordered grow-0"
          disabled={true}
          name="canton"
          placeholder={reportedBridge.canton}
          readOnly={true}
        />
        <input
          className="input input-bordered grow"
          disabled={true}
          name="municipality"
          placeholder={reportedBridge.municipality}
          readOnly={true}
        />
      </div>
    );
  }
);

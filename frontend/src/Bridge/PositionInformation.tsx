import type { FC } from 'react';
import React from 'react';
import { observer } from 'mobx-react-lite';
import type { ReportBridgeStore } from '../Store/ReportBridgeStore';
import { FormattedMessage } from 'react-intl';
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
              id="report_bridge_no_position"
              defaultMessage={
                'Benutzen Sie die GPS-Funktion Ihres Geräts um die aktuelle Position zu bestimmen.'
              }
            />
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col md:flex-row gap-1 md:items-end justify-stretch">
        <div>
          <label htmlFor="position" className="label">
            <FormattedMessage
              id="report_bridge_label_position"
              defaultMessage={'Position'}
            />
          </label>
          <input
            className="input input-bordered"
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
          />
        </div>

        <input
          className="input input-bordered grow-0"
          name="canton"
          disabled={true}
          readOnly={true}
          placeholder={reportedBridge.canton}
        />
        <input
          className="input input-bordered grow"
          name="municipality"
          disabled={true}
          readOnly={true}
          placeholder={reportedBridge.municipality}
        />
      </div>
    );
  }
);

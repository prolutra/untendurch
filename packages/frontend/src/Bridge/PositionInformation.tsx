import type { FC } from 'react';

import React from 'react';
import { FormattedMessage } from 'react-intl';

import { LocateMe } from '../Location/LocateMe';
import { getAsLv95 } from '../Store/LatLon';
import { useStore } from '../Store/Store';
import { ManualCoordinates } from './ManualCoordinates';

type Props = {
  onCenterMap?: (coordinates: number[]) => void;
};

export const PositionInformation: FC<Props> = ({ onCenterMap }) => {
  const store = useStore();
  const reportedBridge = store.reportBridge;

  const lv95 = reportedBridge.latLon ? getAsLv95(reportedBridge.latLon) : null;

  return (
    <div className={'flex flex-col gap-2'}>
      {lv95 ? (
        <div className="flex flex-col justify-stretch gap-1 md:flex-row md:items-end">
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
              placeholder={lv95.east.toFixed(2) + ', ' + lv95.west.toFixed(2)}
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
      ) : (
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
      )}
      {/* Rendered once in both states so it keeps its verification notice
          when the first position gets set */}
      <ManualCoordinates onCenterMap={onCenterMap} />
    </div>
  );
};

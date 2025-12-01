import React from 'react';
import { FormattedMessage } from 'react-intl';

import type { BridgeFormState } from '../BridgeFormState';

export function BridgeTraffic(props: {
  onChange: (
    e: React.FormEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  state: BridgeFormState;
}) {
  return (
    <div className={'flex flex-col gap-3 pt-4 border-t border-gray-200'}>
      <h3 className={'text-lg font-semibold'}>
        <FormattedMessage
          defaultMessage={'Verkehr'}
          id="report_bridge_heading_traffic"
        />
      </h3>
      <div>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">
              <FormattedMessage
                defaultMessage={'Verkehrsaufkommen'}
                id="report_bridge_label_traffic"
              />
            </span>
          </div>
          <select
            className="select select-bordered"
            name="traffic"
            onChange={props.onChange}
            value={props.state.traffic}
          >
            <option value={'NO_TRAFFIC'}>
              <FormattedMessage
                defaultMessage={'Kein Verkehr'}
                id="report_bridge_option_NO_TRAFFIC"
              />
            </option>
            <option value={'VERY_LIGHT_TRAFFIC'}>
              <FormattedMessage
                defaultMessage={'Selten (1x pro Tag)'}
                id="report_bridge_option_VERY_LIGHT_TRAFFIC"
              />
            </option>
            <option value={'LIGHT_TRAFFIC'}>
              <FormattedMessage
                defaultMessage={'Wenig (1 Auto pro Stunde)'}
                id="report_bridge_option_LIGHT_TRAFFIC"
              />
            </option>
            <option value={'MEDIUM_TRAFFIC'}>
              <FormattedMessage
                defaultMessage={'Mittel (1 Auto/10 Minuten)'}
                id="report_bridge_option_MEDIUM_TRAFFIC"
              />
            </option>
            <option value={'HEAVY_TRAFFIC'}>
              <FormattedMessage
                defaultMessage={'Hoch (1 Auto / 3 Minuten)'}
                id="report_bridge_option_HEAVY_TRAFFIC"
              />
            </option>
            <option value={'VERY_HEAVY_TRAFFIC'}>
              <FormattedMessage
                defaultMessage={'Sehr hoch (1+ Auto/Minute)'}
                id="report_bridge_option_VERY_HEAVY_TRAFFIC"
              />
            </option>
          </select>
        </label>
      </div>
      <div>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">
              <FormattedMessage
                defaultMessage={'Tempolimite'}
                id="report_bridge_label_speedLimit"
              />
            </span>
          </div>
          <select
            className="select select-bordered"
            name="speedLimit"
            onChange={props.onChange}
            value={props.state.speedLimit}
          >
            <option value={'0_30'}>
              <FormattedMessage
                defaultMessage={'0-30km/h'}
                id="report_bridge_option_0_30"
              />
            </option>
            <option value={'40_50'}>
              <FormattedMessage
                defaultMessage={'40-50km/h'}
                id="report_bridge_option_40_50"
              />
            </option>
            <option value={'60'}>
              <FormattedMessage
                defaultMessage={'60km/h'}
                id="report_bridge_option_60"
              />
            </option>
            <option value={'70_80'}>
              <FormattedMessage
                defaultMessage={'70-80km/h'}
                id="report_bridge_option_70_80"
              />
            </option>
            <option value={'100'}>
              <FormattedMessage
                defaultMessage={'100+hm/h'}
                id="report_bridge_option_100"
              />
            </option>
          </select>
        </label>
      </div>
      <div>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">
              <FormattedMessage
                defaultMessage={'Barrieren, um auf die Strasse zu gelangen'}
                id="report_bridge_label_barriers"
              />
            </span>
          </div>
          <select
            className="select select-bordered"
            name="barriers"
            onChange={props.onChange}
            value={props.state.barriers}
          >
            <option value={'NONE'}>
              <FormattedMessage
                defaultMessage={'keine'}
                id="report_bridge_option_NONE"
              />
            </option>
            <option value={'FENCE_LESS_75MM'}>
              <FormattedMessage
                defaultMessage={'Zaun (Maschendrahtgrösse < 7.5 cm)'}
                id="report_bridge_option_FENCE_LESS_75MM"
              />
            </option>
            <option value={'FENCE_MORE_75MM'}>
              <FormattedMessage
                defaultMessage={'Zaun (Maschendrahtgrösse > 7.5 cm)'}
                id="report_bridge_option_FENCE_MORE_75MM"
              />
            </option>
            <option value={'WALL'}>
              <FormattedMessage
                defaultMessage={'Mauer (> 1.2m)'}
                id="report_bridge_option_WALL"
              />
            </option>
          </select>
        </label>
      </div>
    </div>
  );
}

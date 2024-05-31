import type { BridgeFormState } from '../BridgeFormState';
import React from 'react';
import { FormattedMessage } from 'react-intl';

export function BridgeTraffic(props: {
  state: BridgeFormState;
  onChange: (
    e: React.FormEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}) {
  return (
    <div className={'flex flex-col gap-3'}>
      <h3>
        <FormattedMessage
          id="report_bridge_heading_traffic"
          defaultMessage={'Verkehr'}
        />
      </h3>
      <div>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">
              <FormattedMessage
                id="report_bridge_label_traffic"
                defaultMessage={'Verkehrsaufkommen'}
              />
            </span>
          </div>
          <select
            className="select select-bordered"
            name="traffic"
            value={props.state.traffic}
            onChange={props.onChange}
          >
            <option value={'NO_TRAFFIC'}>
              <FormattedMessage
                id="report_bridge_option_NO_TRAFFIC"
                defaultMessage={'Kein Verkehr'}
              />
            </option>
            <option value={'VERY_LIGHT_TRAFFIC'}>
              <FormattedMessage
                id="report_bridge_option_VERY_LIGHT_TRAFFIC"
                defaultMessage={'Selten (1x pro Tag)'}
              />
            </option>
            <option value={'LIGHT_TRAFFIC'}>
              <FormattedMessage
                id="report_bridge_option_LIGHT_TRAFFIC"
                defaultMessage={'Wenig (1 Auto pro Stunde)'}
              />
            </option>
            <option value={'MEDIUM_TRAFFIC'}>
              <FormattedMessage
                id="report_bridge_option_MEDIUM_TRAFFIC"
                defaultMessage={'Mittel (1 Auto/10 Minuten)'}
              />
            </option>
            <option value={'HEAVY_TRAFFIC'}>
              <FormattedMessage
                id="report_bridge_option_HEAVY_TRAFFIC"
                defaultMessage={'Hoch (1 Auto / 3 Minuten)'}
              />
            </option>
            <option value={'VERY_HEAVY_TRAFFIC'}>
              <FormattedMessage
                id="report_bridge_option_VERY_HEAVY_TRAFFIC"
                defaultMessage={'Sehr hoch (1+ Auto/Minute)'}
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
                id="report_bridge_label_speedLimit"
                defaultMessage={'Tempolimite'}
              />
            </span>
          </div>
          <select
            className="select select-bordered"
            name="speedLimit"
            value={props.state.speedLimit}
            onChange={props.onChange}
          >
            <option value={'0_30'}>
              <FormattedMessage
                id="report_bridge_option_0_30"
                defaultMessage={'0-30km/h'}
              />
            </option>
            <option value={'40_50'}>
              <FormattedMessage
                id="report_bridge_option_40_50"
                defaultMessage={'40-50km/h'}
              />
            </option>
            <option value={'60'}>
              <FormattedMessage
                id="report_bridge_option_60"
                defaultMessage={'60km/h'}
              />
            </option>
            <option value={'70_80'}>
              <FormattedMessage
                id="report_bridge_option_70_80"
                defaultMessage={'70-80km/h'}
              />
            </option>
            <option value={'100'}>
              <FormattedMessage
                id="report_bridge_option_100"
                defaultMessage={'100+hm/h'}
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
                id="report_bridge_label_barriers"
                defaultMessage={'Barrieren, um auf die Strasse zu gelangen'}
              />
            </span>
          </div>
          <select
            className="select select-bordered"
            name="barriers"
            value={props.state.barriers}
            onChange={props.onChange}
          >
            <option value={'NONE'}>
              <FormattedMessage
                id="report_bridge_option_NONE"
                defaultMessage={'keine'}
              />
            </option>
            <option value={'FENCE_LESS_75MM'}>
              <FormattedMessage
                id="report_bridge_option_FENCE_LESS_75MM"
                defaultMessage={'Zaun (Maschendrahtgrösse < 7.5 cm)'}
              />
            </option>
            <option value={'FENCE_MORE_75MM'}>
              <FormattedMessage
                id="report_bridge_option_FENCE_MORE_75MM"
                defaultMessage={'Zaun (Maschendrahtgrösse > 7.5 cm)'}
              />
            </option>
            <option value={'WALL'}>
              <FormattedMessage
                id="report_bridge_option_WALL"
                defaultMessage={'Mauer (> 1.2m)'}
              />
            </option>
          </select>
        </label>
      </div>
    </div>
  );
}

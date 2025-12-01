import type { FC } from 'react';

import React from 'react';

import type { BridgeFormState } from '../BridgeFormState';

type Props = {
  onChange: (
    e: React.FormEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  state: BridgeFormState;
};

export const BridgeShape: FC<Props> = (props) => {
  const bridgeShapes = ['a', 'b', 'c', 'd', 'e', 'f'];
  return (
    <div className={'grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12'}>
      {bridgeShapes.map((shape) => (
        <div className={'form-control'} key={shape}>
          <label className="label cursor-pointer">
            <input
              checked={props.state.shape === shape}
              className="radio"
              name="shape"
              onChange={props.onChange}
              required
              type="radio"
              value={shape}
            />
            <img
              alt={''}
              className={'w-32 md:w-48'}
              src={`/shape/${shape}.png`}
            />
          </label>
        </div>
      ))}
    </div>
  );
};

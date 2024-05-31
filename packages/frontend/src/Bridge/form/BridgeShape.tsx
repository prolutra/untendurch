import type { FC } from 'react';
import React from 'react';
import type { BridgeFormState } from '../BridgeFormState';

type Props = {
  state: BridgeFormState;
  onChange: (
    e: React.FormEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
};

export const BridgeShape: FC<Props> = (props) => {
  const bridgeShapes = ['a', 'b', 'c', 'd', 'e', 'f'];
  return (
    <div className={'grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12'}>
      {bridgeShapes.map((shape) => (
        <div key={shape} className={'form-control'}>
          <label className="label cursor-pointer">
            <input
              type="radio"
              name="shape"
              value={shape}
              required
              checked={props.state.shape === shape}
              onChange={props.onChange}
              className="radio"
            />
            <img
              className={'w-32 md:w-48'}
              src={`/shape/${shape}.png`}
              alt={''}
            />
          </label>
        </div>
      ))}
    </div>
  );
};

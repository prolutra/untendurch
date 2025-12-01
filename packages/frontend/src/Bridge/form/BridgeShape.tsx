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
    <div className={'grid grid-cols-2 md:grid-cols-3 gap-4'}>
      {bridgeShapes.map((shape) => {
        const isSelected = props.state.shape === shape;
        return (
          <label
            className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all ${
              isSelected
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
            key={shape}
          >
            <input
              checked={isSelected}
              className="sr-only"
              name="shape"
              onChange={props.onChange}
              required
              type="radio"
              value={shape}
            />
            <img
              alt={`Bridge shape ${shape.toUpperCase()}`}
              className={'w-full'}
              src={`/shape/${shape}.png`}
            />
            {isSelected && (
              <div className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </label>
        );
      })}
    </div>
  );
};

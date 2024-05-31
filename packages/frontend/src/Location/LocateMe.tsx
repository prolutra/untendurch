import React, { useState } from 'react';
import { useStore } from '../Store/Store';

export const LocateMe = () => {
  const store = useStore();
  const [isBusy, setIsBusy] = useState(false);

  const locateMe = async () => {
    setIsBusy(true);
    await store.currentPosition.locateMe();
    setIsBusy(false);
  };

  return (
    <button
      type={'button'}
      className={
        'btn btn-lg btn-circle rounded-full btn-success relative drop-shadow'
      }
      onClick={locateMe}
      title={'Locate me'}
    >
      <img
        src={'/user-location-line.svg'}
        className={'z-10 w-auto h-3/4'}
        alt={'Locate me'}
      />
      {isBusy && (
        <div
          className={
            'absolute z-20 w-full h-full loading loading-spinner text-white'
          }
        ></div>
      )}
    </button>
  );
};

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
      className={
        'btn btn-md md:btn-lg btn-circle rounded-full btn-success relative drop-shadow'
      }
      onClick={locateMe}
      title={'Locate me'}
      type={'button'}
    >
      <img
        alt={'Locate me'}
        className={'z-10 w-auto h-3/4'}
        src={'/user-location-line.svg'}
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

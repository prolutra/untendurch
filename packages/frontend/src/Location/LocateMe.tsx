import { LocateFixed } from 'lucide-react';
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
      <LocateFixed className="z-10 h-6 w-6 md:h-8 md:w-8 text-white" />
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

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
        'btn btn-md btn-circle btn-success relative rounded-full drop-shadow md:btn-lg'
      }
      onClick={locateMe}
      title={'Locate me'}
      type={'button'}
    >
      <LocateFixed className="z-10 h-6 w-6 text-white md:h-8 md:w-8" />
      {isBusy && (
        <div
          className={
            'loading loading-spinner absolute z-20 h-full w-full text-white'
          }
        ></div>
      )}
    </button>
  );
};

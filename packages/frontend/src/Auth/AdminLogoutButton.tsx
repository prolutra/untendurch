import React from 'react';

import { useStore } from '../Store/Store';

export const AdminLogoutButton = () => {
  const store = useStore();

  function logout() {
    store.auth.logout();
  }

  return (
    <>
      {store.auth.sessionToken && (
        <button className={'btn btn-ghost btn-circle'} onClick={logout}>
          <img
            alt={'logout'}
            className={'size-full'}
            src={'/logout-circle-r-line.svg'}
          />
        </button>
      )}
    </>
  );
};

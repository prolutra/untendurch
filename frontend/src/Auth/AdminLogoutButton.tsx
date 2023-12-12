import { observer } from 'mobx-react-lite';
import React from 'react';
import { useStore } from '../Store/Store';

export const AdminLogoutButton = observer(() => {
  const store = useStore();

  function logout() {
    store.auth.logout();
  }

  return (
    <>
      {store.auth.sessionToken && (
        <button className={'btn btn-ghost btn-circle'} onClick={logout}>
          <img
            src={'/logout-circle-r-line.svg'}
            className={'size-full'}
            alt={'logout'}
          />
        </button>
      )}
    </>
  );
});

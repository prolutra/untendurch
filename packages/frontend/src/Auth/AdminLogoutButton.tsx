import { LogOut } from 'lucide-react';
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
          <LogOut className="h-6 w-6" />
        </button>
      )}
    </>
  );
};

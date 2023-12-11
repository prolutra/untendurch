import { observer } from 'mobx-react-lite';
import React from 'react';
import { IconButton, Image } from 'theme-ui';
import { useStore } from '../Store/Store';

const AdminLogoutButton = observer(() => {
  const store = useStore();

  function logout() {
    store.auth.logout();
  }

  return (
    <>
      {store.auth.sessionToken && (
        <IconButton
          variant="secondary"
          sx={{
            width: [48, 48],
            height: [48, 48],
            cursor: 'pointer',
            borderRadius: '50%',
            backgroundColor: 'white',
          }}
          onClick={logout}
          className="logout"
        >
          <Image src={'/logout-circle-r-line.svg'} width={48} height={48} />
        </IconButton>
      )}
    </>
  );
});

export default AdminLogoutButton;

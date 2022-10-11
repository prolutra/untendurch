import React from 'react';
import { Box, IconButton, Image } from 'theme-ui';
import { useStore } from '../Store/Store';

const LocateMe = () => {
  const store = useStore();

  function locateMe() {
    store.currentPosition.locateMe();
  }

  return (
    <Box
      sx={{
        position: 'relative',
        marginLeft: 'calc(80% - 30px)',
        top: [-20, -60],
        marginBottom: [-90, -120],
        paddingTop: '1px',
        paddingLeft: '1px',

        backgroundColor: 'gray',
        borderRadius: '50%',
        width: [90, 120],
        height: [90, 120],

        filter: 'drop-shadow(2px 2px 4px gray)',
      }}
    >
      <IconButton
        sx={{
          width: [90, 120],
          height: [90, 120],
          cursor: 'pointer',
          borderRadius: '50%',
          backgroundColor: 'white',
        }}
        onClick={locateMe}
        className="locateMeIconButton"
      >
        <Image src={'/user-location-line.svg'} width={48} height={48} />
      </IconButton>
    </Box>
  );
};

export default LocateMe;

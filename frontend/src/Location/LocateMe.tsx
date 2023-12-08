import React from 'react';
import type { ThemeUICSSProperties } from 'theme-ui';
import { Box, IconButton, Image } from 'theme-ui';
import { useStore } from '../Store/Store';
import { useLocation } from 'react-router-dom';

const LocateMe = () => {
  const store = useStore();
  const path = useLocation().pathname;

  function locateMe() {
    store.currentPosition.locateMe();
  }

  const isBridgeNew = path.includes('/new');

  const defaultPosition: ThemeUICSSProperties = {
    position: ['fixed', 'relative'],
    marginLeft: [0, 'calc(80%)'],
    top: ['auto', -40],
    right: [3, 'auto'],
    bottom: [3, 'auto'],
    left: ['auto', 'auto'],
    borderRadius: '50%',
    width: [64, 96],
    height: [64, 96],
    filter: 'drop-shadow(2px 2px 3px var(--theme-ui-colors-primary))',
  };

  const formPosition: ThemeUICSSProperties = {
    position: 'relative',
    marginLeft: 'calc(80%)',
    mb: -3,
    top: [-30, -40],
    right: [3, 'auto'],
    bottom: [3, 'auto'],
    left: ['auto', 'auto'],
    borderRadius: '50%',
    width: [64, 96],
    height: [64, 96],
    filter: 'drop-shadow(2px 2px 3px var(--theme-ui-colors-primary))',
  };

  return (
    <Box sx={isBridgeNew ? formPosition : defaultPosition}>
      <IconButton
        variant="secondary"
        sx={{
          width: '100%',
          height: '100%',
          p: [3, 24],
          borderRadius: '50%',
        }}
        onClick={locateMe}
        title={'Locate me'}
      >
        <Image
          src={'/user-location-line.svg'}
          sx={{
            width: '100%',
            height: '100%',
          }}
        />
      </IconButton>
    </Box>
  );
};

export default LocateMe;

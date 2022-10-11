import { observer } from 'mobx-react-lite';
import 'ol/ol.css';

import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from '../Store/Store';
import { Box, Button } from 'theme-ui';
import { FormattedMessage } from 'react-intl';
import OverviewFilters from './OverviewFilters';
import OverviewExport from './OverviewExport';

const Overview = observer(() => {
  const store = useStore();

  useEffect(() => {
    store.mapSettings.setMode('FULL');
    store.reportBridge.setLatLon(null);
  }, []);

  return (
    <>
      <Box sx={{ display: ['none', 'none', 'initial', 'initial'] }}>
        <OverviewFilters></OverviewFilters>
      </Box>
      {store.auth.sessionToken && <OverviewExport></OverviewExport>}
      <Link to="/bridges/new">
        <Button
          className="reportButton"
          sx={{
            fontSize: '1.61rem',
            bottom: '3rem',
            left: ['calc(50% - 135px)', 'calc(50% - 135px)', '7%', '7%'],
            cursor: 'pointer',
          }}
        >
          <FormattedMessage
            id="overview_button_report"
            defaultMessage={'Brücke erfassen'}
          />
        </Button>
      </Link>
    </>
  );
});

export default Overview;

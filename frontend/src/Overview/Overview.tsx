import { observer } from 'mobx-react-lite';

import type { FC } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../Store/Store';
import { Box, Button } from 'theme-ui';
import { FormattedMessage } from 'react-intl';
import OverviewFilters from './OverviewFilters';
import OverviewExport from './OverviewExport';

const Overview: FC = observer(() => {
  const store = useStore();

  useEffect(() => {
    store.mapSettings.setMode('FULL');
    store.reportBridge.setLatLon(null);
  }, []);

  return (
    <>
      <Box sx={{ display: ['none', 'none', 'initial'], position: 'relative' }}>
        <OverviewFilters></OverviewFilters>
      </Box>
      {store.auth.sessionToken && <OverviewExport></OverviewExport>}
      <Link to="/bridges/new">
        <Button
          variant="primary"
          sx={{
            fontSize: [3, 4],
            bottom: [3, 4],
            right: ['auto', 4],
            left: [3, 'auto'],
            cursor: 'pointer',
            position: 'fixed',
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

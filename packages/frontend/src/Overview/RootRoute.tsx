import { observer } from 'mobx-react-lite';

import type { FC } from 'react';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../Store/Store';
import { FormattedMessage } from 'react-intl';
import { OverviewFilters } from './OverviewFilters';
import { OverviewExport } from './OverviewExport';
import { MapWrapper } from '../Map/MapWrapper';
import { Layout } from '../Layout';

export const RootRoute: FC = observer(() => {
  const store = useStore();

  useEffect(() => {
    store.mapSettings.setMode('FULL');
    store.reportBridge.setLatLon(null);
  }, []);

  return (
    <Layout>
      <MapWrapper>
        <div className={'absolute top-3 left-16 hidden md:block z-10'}>
          <OverviewFilters></OverviewFilters>
        </div>
        {store.auth.sessionToken && (
          <div className={'absolute z-10 top-4 right-4'}>
            <OverviewExport></OverviewExport>
          </div>
        )}
        <div className={'absolute z-10 bottom-4 right-4'}>
          <Link to="/bridges/new">
            <button className="btn btn-primary btn-lg">
              <FormattedMessage
                id="overview_button_report"
                defaultMessage={'Brücke erfassen'}
              />
            </button>
          </Link>
        </div>
      </MapWrapper>
    </Layout>
  );
});

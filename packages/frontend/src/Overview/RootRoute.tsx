import type { FC } from 'react';

import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { Layout } from '../Layout';
import { MapWrapper } from '../Map/MapWrapper';
import { useStore } from '../Store/Store';
import { OverviewExport } from './OverviewExport';
import { OverviewFilters } from './OverviewFilters';

export const RootRoute: FC = observer(() => {
  const store = useStore();

  useEffect(() => {
    store.mapSettings.setMode('FULL');
    store.reportBridge.setLatLon(null);
  }, []);

  return (
    <Layout fullHeight>
      <MapWrapper>
        <div className={'absolute top-3 left-16 hidden md:block z-10'}>
          <OverviewFilters></OverviewFilters>
        </div>
        {store.auth.sessionToken && (
          <div className={'absolute z-10 top-4 right-4'}>
            <OverviewExport></OverviewExport>
          </div>
        )}
        <div
          className={
            'absolute z-10 bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto'
          }
        >
          <Link to="/bridges/new">
            <button className="btn btn-primary btn-lg w-full md:w-auto">
              <FormattedMessage
                defaultMessage={'Brücke erfassen'}
                id="overview_button_report"
              />
            </button>
          </Link>
        </div>
      </MapWrapper>
    </Layout>
  );
});

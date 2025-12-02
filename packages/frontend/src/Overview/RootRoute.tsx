import type { FC } from 'react';

import { Plus } from 'lucide-react';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';

import { WelcomeModal } from '../components/WelcomeModal';
import { Layout } from '../Layout';
import { MapWrapper } from '../Map/MapWrapper';
import { useStore } from '../Store/Store';
import { OverviewExport } from './OverviewExport';
import { OverviewFilters } from './OverviewFilters';

export const RootRoute: FC = () => {
  const store = useStore();
  const location = useLocation();

  useEffect(() => {
    store.mapSettings.setMode('FULL');
    store.reportBridge.setLatLon(null);
    // Restore main map state if it was saved (e.g., when returning from report bridge)
    store.mapSettings.restoreMainMapState();
  }, [location.pathname]);

  return (
    <Layout fullHeight>
      <WelcomeModal />
      <MapWrapper>
        <div className={'absolute top-3 left-16 z-10'}>
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
              <Plus className="h-5 w-5" />
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
};

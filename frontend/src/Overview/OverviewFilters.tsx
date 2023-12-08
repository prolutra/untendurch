import { observer } from 'mobx-react-lite';
import 'ol/ol.css';

import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { useStore } from '../Store/Store';
import { Box, Button, Label, Select } from 'theme-ui';
import { FormattedMessage } from 'react-intl';
import { AllFilter } from '../Store/AllFilter';
import { SafetyRisk } from '../Store/SafetyRisk';
import { useSearchParams } from 'react-router-dom';

const OverviewFilters: FC = observer(() => {
  const store = useStore();

  type OverviewFiltersState = {
    canton: string;
    municipality: string;
    status: string;
    otterFriendly: string;
    safetyRisk: string;
  };

  const defaultState = {
    canton: AllFilter,
    municipality: AllFilter,
    status: AllFilter,
    otterFriendly: AllFilter,
    safetyRisk: AllFilter,
  } as OverviewFiltersState;

  const [searchParams, setSearchParams] = useSearchParams();

  const [state, setState] = useState<OverviewFiltersState>(defaultState);

  useEffect(() => {
    const stateFromParams = Object.fromEntries([
      ...searchParams,
    ]) as OverviewFiltersState;

    setState({
      ...defaultState,
      ...stateFromParams,
    });
  }, []);

  useEffect(() => {
    store.mapSettings.setFilterCanton(state.canton);
    setSearchParams(state);
  }, [state.canton]);

  useEffect(() => {
    store.mapSettings.setFilterMunicipality(state.municipality);
    setSearchParams(state);
  }, [state.municipality]);

  useEffect(() => {
    store.mapSettings.setFilterStatus(state.status);
    setSearchParams(state);
  }, [state.status]);

  useEffect(() => {
    store.mapSettings.setFilterOtterFriendly(state.otterFriendly);
    setSearchParams(state);
  }, [state.otterFriendly]);

  useEffect(() => {
    store.mapSettings.setFilterSafetyRisk(state.safetyRisk);
    setSearchParams(state);
  }, [state.safetyRisk]);

  const handleChange = (e: React.FormEvent<HTMLSelectElement>) => {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;

    // toggle around if switching between municipalities and cantons
    if ('municipality' === name) {
      const municipality = store.cantonMunicipality.municipalities.find(
        (municipality) => value === municipality.name
      );
      setState((previousState) => ({
        municipality: value,
        canton: municipality ? municipality.canton : AllFilter,
        status: previousState.status,
        otterFriendly: previousState.otterFriendly,
        safetyRisk: previousState.safetyRisk,
      }));
    } else if ('canton' === name) {
      setState((previousState) => ({
        municipality: AllFilter,
        canton: value,
        status: previousState.status,
        otterFriendly: previousState.otterFriendly,
        safetyRisk: previousState.safetyRisk,
      }));
    } else {
      /* eslint-disable */
      setState(
        (previousState) =>
          ({
            ...previousState,
            [name]: value,
          }) as any
      );
      /* eslint-enable */
    }
  };

  const handleReset = () => {
    setState(defaultState);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        zIndex: 3000,
        position: 'fixed',
        fontSize: 2,
        top: '112px',
        left: 5,
        p: 2,
        pt: 1,
        backgroundColor: 'rgba(255,255,255,0.75)',
        borderRadius: '5px',
        alignItems: 'flex-end',
      }}
    >
      <Box>
        <Label htmlFor="canton">
          <FormattedMessage
            id="overview_filters_label_canton"
            defaultMessage={'Kanton'}
          />
        </Label>
        <Select name="canton" value={state.canton} onChange={handleChange}>
          <option value={AllFilter}>
            <FormattedMessage
              id="overview_filters_select_ALL"
              defaultMessage={'Alle'}
            />
          </option>
          {store.cantonMunicipality.cantons.map((canton) => (
            <option key={canton} value={canton}>
              {canton}
            </option>
          ))}
        </Select>
      </Box>
      <Box>
        <Label htmlFor="municipality">
          <FormattedMessage
            id="overview_filters_label_municipality"
            defaultMessage={'Gemeinde'}
          />
        </Label>
        <Select
          name="municipality"
          value={state.municipality}
          onChange={handleChange}
        >
          <option value={AllFilter}>
            <FormattedMessage
              id="overview_filters_select_ALL"
              defaultMessage={'Alle'}
            />
          </option>
          {store.cantonMunicipality.municipalities
            .filter(
              (municipality) =>
                state.canton === AllFilter ||
                state.canton === municipality.canton
            )
            .map((municipality) => (
              <option
                key={municipality.canton + '_' + municipality.name}
                value={municipality.name}
              >
                {municipality.name}
              </option>
            ))}
        </Select>
      </Box>
      <Box>
        <Label htmlFor="status">
          <FormattedMessage
            id="overview_filters_label_status"
            defaultMessage={'Status'}
          />
        </Label>
        <Select name="status" value={state.status} onChange={handleChange}>
          <option value={AllFilter}>
            <FormattedMessage
              id="overview_filters_select_ALL"
              defaultMessage={'Alle'}
            />
          </option>
          <option value={'UNVERIFIED'}>
            <FormattedMessage
              id="overview_filters_select_status_unverified"
              defaultMessage={'Nicht verifiziert'}
            />
          </option>
          <option value={'VERIFIED'}>
            <FormattedMessage
              id="overview_filters_select_status_verified"
              defaultMessage={'Verifiziert'}
            />
          </option>
        </Select>
      </Box>
      <Box>
        <Label htmlFor="otterFriendly">
          <FormattedMessage
            id="overview_filters_label_otter_friendly"
            defaultMessage={'Otterfreundlich'}
          />
        </Label>
        <Select
          name="otterFriendly"
          value={state.otterFriendly}
          onChange={handleChange}
        >
          <option value={AllFilter}>
            <FormattedMessage
              id="overview_filters_select_ALL"
              defaultMessage={'Alle'}
            />
          </option>
          <option value={'FRIENDLY'}>
            <FormattedMessage
              id="otter_friendly_FRIENDLY"
              defaultMessage={'Freundlich'}
            />
          </option>
          <option value={'UNFRIENDLY'}>
            <FormattedMessage
              id="otter_friendly_UNFRIENDLY"
              defaultMessage={'Unfreundlich'}
            />
          </option>
        </Select>
      </Box>
      <Box>
        <Label htmlFor="safetyRisk">
          <FormattedMessage
            id="overview_filters_label_safety_risk"
            defaultMessage={'Sicherheitsrisiko'}
          />
        </Label>

        <Select
          name="safetyRisk"
          value={state.safetyRisk}
          onChange={handleChange}
        >
          <option value={AllFilter}>
            <FormattedMessage
              id="overview_filters_select_ALL"
              defaultMessage={'Alle'}
            />
          </option>
          {Object.keys(SafetyRisk).map((safetyRisk) => (
            <option key={safetyRisk} value={safetyRisk}>
              <FormattedMessage
                id={`safety_risk_${safetyRisk}`}
                defaultMessage={safetyRisk}
              />
            </option>
          ))}
        </Select>
      </Box>
      <Box>
        <Button sx={{ mt: 3 }} onClick={handleReset} variant="close">
          &times;
        </Button>
      </Box>
    </Box>
  );
});

export default OverviewFilters;

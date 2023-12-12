import { observer } from 'mobx-react-lite';
import 'ol/ol.css';

import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { useStore } from '../Store/Store';
import { FormattedMessage } from 'react-intl';
import { AllFilter } from '../Store/AllFilter';
import { SafetyRisk } from '../Store/SafetyRisk';
import { useSearchParams } from 'react-router-dom';
import { CloseChar } from '../lib/closeChar';

export const OverviewFilters: FC = observer(() => {
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
    <div
      className={
        'flex gap-2 p-2 pt-0 fixed bg-white bg-opacity-75 rounded items-end'
      }
    >
      <div className={'form-control'}>
        <label className={'label'} htmlFor="canton">
          <FormattedMessage
            id="overview_filters_label_canton"
            defaultMessage={'Kanton'}
          />
        </label>
        <select
          className={'select select-bordered'}
          name="canton"
          value={state.canton}
          onChange={handleChange}
        >
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
        </select>
      </div>
      <div className={'form-control'}>
        <label className={'label'} htmlFor="municipality">
          <FormattedMessage
            id="overview_filters_label_municipality"
            defaultMessage={'Gemeinde'}
          />
        </label>
        <select
          className={'select select-bordered'}
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
        </select>
      </div>
      <div className={'form-control'}>
        <label className={'label'} htmlFor="status">
          <FormattedMessage
            id="overview_filters_label_status"
            defaultMessage={'Status'}
          />
        </label>
        <select
          className={'select select-bordered'}
          name="status"
          value={state.status}
          onChange={handleChange}
        >
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
        </select>
      </div>
      <div className={'form-control'}>
        <label className={'label'} htmlFor="otterFriendly">
          <FormattedMessage
            id="overview_filters_label_otter_friendly"
            defaultMessage={'Otterfreundlich'}
          />
        </label>
        <select
          className={'select select-bordered'}
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
        </select>
      </div>
      <div className={'form-control'}>
        <label className={'label'} htmlFor="safetyRisk">
          <FormattedMessage
            id="overview_filters_label_safety_risk"
            defaultMessage={'Sicherheitsrisiko'}
          />
        </label>

        <select
          className={'select select-bordered'}
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
        </select>
      </div>
      <div className={'pb-2'}>
        <button className={'btn btn-circle btn-neutral'} onClick={handleReset}>
          {CloseChar}
        </button>
      </div>
    </div>
  );
});

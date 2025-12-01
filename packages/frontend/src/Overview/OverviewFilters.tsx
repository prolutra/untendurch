import type { FC } from 'react';

import 'ol/ol.css';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import type { Municipality } from '../Store/Municipality';

import { CloseChar } from '../lib/closeChar';
import { AllFilter } from '../Store/AllFilter';
import { SafetyRisk } from '../Store/SafetyRisk';
import { useStore } from '../Store/Store';

export const OverviewFilters: FC = () => {
  const store = useStore();

  type OverviewFiltersState = {
    canton: string;
    municipality: string;
    otterFriendly: string;
    safetyRisk: string;
  };

  const defaultState = {
    canton: AllFilter,
    municipality: AllFilter,
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
        (m: Municipality) => value === m.name
      );
      setState((previousState) => ({
        canton: municipality ? municipality.canton : AllFilter,
        municipality: value,
        otterFriendly: previousState.otterFriendly,
        safetyRisk: previousState.safetyRisk,
      }));
    } else if ('canton' === name) {
      setState((previousState) => ({
        canton: value,
        municipality: AllFilter,
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
            defaultMessage={'Kanton'}
            id="overview_filters_label_canton"
          />
        </label>
        <select
          className={'select select-bordered'}
          name="canton"
          onChange={handleChange}
          value={state.canton}
        >
          <option value={AllFilter}>
            <FormattedMessage
              defaultMessage={'Alle'}
              id="overview_filters_select_ALL"
            />
          </option>
          {store.cantonMunicipality.cantons.map((canton: string) => (
            <option key={canton} value={canton}>
              {canton}
            </option>
          ))}
        </select>
      </div>
      <div className={'form-control'}>
        <label className={'label'} htmlFor="municipality">
          <FormattedMessage
            defaultMessage={'Gemeinde'}
            id="overview_filters_label_municipality"
          />
        </label>
        <select
          className={'select select-bordered'}
          name="municipality"
          onChange={handleChange}
          value={state.municipality}
        >
          <option value={AllFilter}>
            <FormattedMessage
              defaultMessage={'Alle'}
              id="overview_filters_select_ALL"
            />
          </option>
          {store.cantonMunicipality.municipalities
            .filter(
              (m: Municipality) =>
                state.canton === AllFilter || state.canton === m.canton
            )
            .map((municipality: Municipality) => (
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
        <label className={'label'} htmlFor="otterFriendly">
          <FormattedMessage
            defaultMessage={'Otterfreundlich'}
            id="overview_filters_label_otter_friendly"
          />
        </label>
        <select
          className={'select select-bordered'}
          name="otterFriendly"
          onChange={handleChange}
          value={state.otterFriendly}
        >
          <option value={AllFilter}>
            <FormattedMessage
              defaultMessage={'Alle'}
              id="overview_filters_select_ALL"
            />
          </option>
          <option value={'FRIENDLY'}>
            <FormattedMessage
              defaultMessage={'Freundlich'}
              id="otter_friendly_FRIENDLY"
            />
          </option>
          <option value={'UNFRIENDLY'}>
            <FormattedMessage
              defaultMessage={'Unfreundlich'}
              id="otter_friendly_UNFRIENDLY"
            />
          </option>
        </select>
      </div>
      <div className={'form-control'}>
        <label className={'label'} htmlFor="safetyRisk">
          <FormattedMessage
            defaultMessage={'Sicherheitsrisiko'}
            id="overview_filters_label_safety_risk"
          />
        </label>

        <select
          className={'select select-bordered'}
          name="safetyRisk"
          onChange={handleChange}
          value={state.safetyRisk}
        >
          <option value={AllFilter}>
            <FormattedMessage
              defaultMessage={'Alle'}
              id="overview_filters_select_ALL"
            />
          </option>
          {Object.keys(SafetyRisk).map((safetyRisk) => (
            <option key={safetyRisk} value={safetyRisk}>
              <FormattedMessage
                defaultMessage={safetyRisk}
                id={`safety_risk_${safetyRisk}`}
              />
            </option>
          ))}
        </select>
      </div>
      <div>
        <button className={'btn btn-circle btn-ghost'} onClick={handleReset}>
          {CloseChar}
        </button>
      </div>
    </div>
  );
};

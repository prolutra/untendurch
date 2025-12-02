import type { FC } from 'react';

import { Filter, Settings } from 'lucide-react';
import 'ol/ol.css';
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import type { Municipality } from '../Store/Municipality';

import { AllFilter } from '../Store/AllFilter';
import { SafetyRisk } from '../Store/SafetyRisk';
import { useStore } from '../Store/Store';

type OverviewFiltersState = {
  canton: string;
  municipality: string;
  otterFriendly: string;
  safetyRisk: string;
};

const defaultState: OverviewFiltersState = {
  canton: AllFilter,
  municipality: AllFilter,
  otterFriendly: AllFilter,
  safetyRisk: AllFilter,
};

export const OverviewFilters: FC = () => {
  const store = useStore();
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<OverviewFiltersState>(defaultState);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
      if (viewRef.current && !viewRef.current.contains(event.target as Node)) {
        setViewOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleClusteringToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.mapSettings.setClusteringEnabled(e.target.checked);
  };

  const handleRiskyPinsToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.mapSettings.setShowRiskyPinsUnclustered(e.target.checked);
  };

  // Count active filters
  const activeFilterCount = [
    state.canton !== AllFilter,
    state.municipality !== AllFilter,
    state.otterFriendly !== AllFilter,
    state.safetyRisk !== AllFilter,
  ].filter(Boolean).length;

  return (
    <div className="flex gap-2">
      {/* Filter Dropdown */}
      <div className="relative" ref={filterRef}>
        <button
          className="btn btn-sm gap-1 border-gray-300 bg-white/90 hover:bg-white"
          onClick={() => {
            setFilterOpen(!filterOpen);
            setViewOpen(false);
          }}
        >
          <Filter className="h-4 w-4" />
          <FormattedMessage
            defaultMessage="Filter"
            id="overview_filters_title"
          />
          {activeFilterCount > 0 && (
            <span className="badge badge-primary badge-sm">
              {activeFilterCount}
            </span>
          )}
        </button>

        {filterOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-box bg-base-100 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">
                <FormattedMessage
                  defaultMessage="Filter"
                  id="overview_filters_header"
                />
              </span>
              <button
                className="btn btn-xs btn-ghost"
                onClick={() => {
                  handleReset();
                  setFilterOpen(false);
                }}
              >
                <FormattedMessage
                  defaultMessage="Zurücksetzen"
                  id="overview_filters_reset"
                />
              </button>
            </div>

            <div className="space-y-2">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">
                    <FormattedMessage
                      defaultMessage="Kanton"
                      id="overview_filters_label_canton"
                    />
                  </span>
                </div>
                <select
                  className="select select-bordered w-full"
                  name="canton"
                  onChange={handleChange}
                  value={state.canton}
                >
                  <option value={AllFilter}>Alle</option>
                  {store.cantonMunicipality.cantons.map((canton: string) => (
                    <option key={canton} value={canton}>
                      {canton}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">
                    <FormattedMessage
                      defaultMessage="Gemeinde"
                      id="overview_filters_label_municipality"
                    />
                  </span>
                </div>
                <select
                  className="select select-bordered w-full"
                  name="municipality"
                  onChange={handleChange}
                  value={state.municipality}
                >
                  <option value={AllFilter}>Alle</option>
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
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">
                    <FormattedMessage
                      defaultMessage="Otterfreundlich"
                      id="overview_filters_label_otter_friendly"
                    />
                  </span>
                </div>
                <select
                  className="select select-bordered w-full"
                  name="otterFriendly"
                  onChange={handleChange}
                  value={state.otterFriendly}
                >
                  <option value={AllFilter}>Alle</option>
                  <option value="FRIENDLY">Freundlich</option>
                  <option value="UNFRIENDLY">Unfreundlich</option>
                </select>
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">
                    <FormattedMessage
                      defaultMessage="Sicherheitsrisiko"
                      id="overview_filters_label_safety_risk"
                    />
                  </span>
                </div>
                <select
                  className="select select-bordered w-full"
                  name="safetyRisk"
                  onChange={handleChange}
                  value={state.safetyRisk}
                >
                  <option value={AllFilter}>Alle</option>
                  {Object.keys(SafetyRisk).map((safetyRisk) => (
                    <option key={safetyRisk} value={safetyRisk}>
                      {safetyRisk}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* View Options Dropdown */}
      <div className="relative" ref={viewRef}>
        <button
          className="btn btn-sm gap-1 border-gray-300 bg-white/90 hover:bg-white"
          onClick={() => {
            setViewOpen(!viewOpen);
            setFilterOpen(false);
          }}
        >
          <Settings className="h-4 w-4" />
          <FormattedMessage
            defaultMessage="Ansicht"
            id="overview_filters_view"
          />
        </button>

        {viewOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-box bg-base-100 p-4 shadow-lg">
            <div className="mb-3 text-sm font-medium">
              <FormattedMessage
                defaultMessage="Ansicht"
                id="overview_filters_view_header"
              />
            </div>

            <label className="flex cursor-pointer items-center justify-between py-2">
              <span className="label-text select-none">
                <FormattedMessage
                  defaultMessage="Pins gruppieren"
                  id="overview_filters_clustering"
                />
              </span>
              <input
                checked={store.mapSettings.clusteringEnabled}
                className="checkbox-primary checkbox checkbox-sm"
                onChange={handleClusteringToggle}
                type="checkbox"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between py-2">
              <span className="label-text select-none">
                <FormattedMessage
                  defaultMessage="Riskante Brücken immer zeigen"
                  id="overview_filters_show_risky"
                />
              </span>
              <input
                checked={store.mapSettings.showRiskyPinsUnclustered}
                className="checkbox-primary checkbox checkbox-sm"
                onChange={handleRiskyPinsToggle}
                type="checkbox"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

import { model, Model, prop, registerRootStore } from 'mobx-keystone';
import React, { createContext, useContext, useState } from 'react';

import { AuthStore } from './AuthStore';
import { CantonMunicipalityStore } from './CantonMunicipalityStore';
import { CurrentPositionStore } from './CurrentPositionStore';
import { ExistingBridgesStore } from './ExistingBridgesStore';
import { MapStore as MapSettingsStore } from './MapSettingsStore';
import { ReportBridgeStore } from './ReportBridgeStore';

@model('untendurch/RootStore')
export class RootStore extends Model({
  auth: prop<AuthStore>(() => new AuthStore({})),
  cantonMunicipality: prop<CantonMunicipalityStore>(
    () => new CantonMunicipalityStore({})
  ),
  currentPosition: prop<CurrentPositionStore>(
    () => new CurrentPositionStore({})
  ),
  existingBridges: prop<ExistingBridgesStore>(
    () => new ExistingBridgesStore({})
  ),
  mapSettings: prop<MapSettingsStore>(() => new MapSettingsStore({})),
  reportBridge: prop<ReportBridgeStore>(() => new ReportBridgeStore({})),
}) {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rootStore: any | RootStore = null;

interface StoreProviderProps {
  children: React.ReactNode;
}

export function initStore(): RootStore {
  rootStore = new RootStore({});

  registerRootStore(rootStore);

  return rootStore;
}

const StoreContext = createContext<null | RootStore>(null);

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [storeContext] = useState(() => initStore());

  return (
    <StoreContext.Provider value={storeContext}>
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): RootStore {
  const store: RootStore = useContext(StoreContext) as RootStore;

  if (!store) {
    throw new Error('[store][useStore][usageOutsideStoreProvider]');
  }

  return store;
}

export { rootStore };

import { model, Model, prop, registerRootStore } from 'mobx-keystone';
import React, { createContext, useContext, useState } from 'react';
import { CurrentPositionStore } from './CurrentPositionStore';
import { ReportBridgeStore } from './ReportBridgeStore';
import { ExistingBridgesStore } from './ExistingBridgesStore';
import { MapStore as MapSettingsStore } from './MapSettingsStore';
import { AuthStore } from './AuthStore';
import { CantonMunicipalityStore } from './CantonMunicipalityStore';

@model('untendurch/RootStore')
export class RootStore extends Model({
  currentPosition: prop<CurrentPositionStore>(
    () => new CurrentPositionStore({})
  ),
  existingBridges: prop<ExistingBridgesStore>(
    () => new ExistingBridgesStore({})
  ),
  reportBridge: prop<ReportBridgeStore>(() => new ReportBridgeStore({})),
  mapSettings: prop<MapSettingsStore>(() => new MapSettingsStore({})),
  auth: prop<AuthStore>(() => new AuthStore({})),
  cantonMunicipality: prop<CantonMunicipalityStore>(
    () => new CantonMunicipalityStore({})
  ),
}) {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rootStore: RootStore | any = null;

export function initStore(): RootStore {
  rootStore = new RootStore({});

  registerRootStore(rootStore);

  return rootStore;
}

interface StoreProviderProps {
  children: React.ReactNode;
}

const StoreContext = createContext<RootStore | null>(null);

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

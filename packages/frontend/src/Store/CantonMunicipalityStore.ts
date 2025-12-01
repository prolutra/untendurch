import Parse from 'parse';
import { create } from 'zustand';

import type { Municipality } from './Municipality';

import cantons from './cantons.json';
import { createMunicipality } from './Municipality';

export type CantonMunicipalityStore = CantonMunicipalityActions &
  CantonMunicipalityState;

interface CantonMunicipalityActions {
  fetchMunicipalities: () => Promise<void>;
  setCantons: (cantons: string[]) => void;
  setMunicipalities: (municipalities: Municipality[]) => void;
}

interface CantonMunicipalityState {
  cantons: string[];
  municipalities: Municipality[];
}

export const useCantonMunicipalityStore = create<CantonMunicipalityStore>(
  (set) => ({
    cantons: [],
    fetchMunicipalities: async () => {
      try {
        const query = new Parse.Query('Municipality');
        const municipalities = await query.limit(9999).find();

        const data = municipalities.map((municipality) => {
          const name = municipality.attributes['name'] as string;
          const canton = municipality.attributes['canton'] as string;
          return createMunicipality(canton, name);
        });

        set({
          municipalities: data.sortI18n((a, b) => [a.name, b.name]),
        });
      } catch (error) {
        console.error('Error executing query', error);
        set({ municipalities: [] });
      }
    },

    municipalities: [],
    setCantons: (cantons) => set({ cantons }),

    setMunicipalities: (municipalities) => set({ municipalities }),
  })
);

/**
 * Initialize cantons and fetch municipalities.
 * Must be called after Parse is initialized.
 */
export function initializeCantonMunicipalityStore() {
  useCantonMunicipalityStore
    .getState()
    .setCantons(cantons.map((canton) => canton.ak).sortedI18n());
  useCantonMunicipalityStore.getState().fetchMunicipalities();
}

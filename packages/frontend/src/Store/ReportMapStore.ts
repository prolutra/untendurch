import { create } from 'zustand';

/**
 * Isolated map state for the bridge reporting form.
 * This store does NOT persist to localStorage - it's ephemeral.
 * When the form is closed, this state is discarded.
 */

// Default to Switzerland center
const DEFAULT_CENTER = [916355.3315324377, 5909283.341607826];
const DEFAULT_ZOOM = 8.5;

export type ReportMapStore = ReportMapActions & ReportMapState;

interface ReportMapActions {
  reset: () => void;
  setCenter: (center: number[]) => void;
  setZoom: (zoom: number) => void;
}

interface ReportMapState {
  center: number[];
  zoom: number;
}

export const useReportMapStore = create<ReportMapStore>((set) => ({
  center: DEFAULT_CENTER,
  reset: () =>
    set({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    }),

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),

  zoom: DEFAULT_ZOOM,
}));

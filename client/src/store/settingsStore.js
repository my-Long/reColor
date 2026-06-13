import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      uiTheme: 'dark',
      toDark:  [],
      toLight: [],
      setUiTheme: (t) => set({ uiTheme: t }),
      setToDark:  (pairs) => set({ toDark:  pairs }),
      setToLight: (pairs) => set({ toLight: pairs }),
      setAll: (next) => set({ toDark: next.toDark, toLight: next.toLight }),
    }),
    {
      name: 'recolor-settings',
    }
  )
);

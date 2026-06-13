import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      toDark:  [],
      toLight: [],
      setToDark:  (pairs) => set({ toDark:  pairs }),
      setToLight: (pairs) => set({ toLight: pairs }),
      setAll: (next) => set({ toDark: next.toDark, toLight: next.toLight }),
    }),
    {
      name: 'recolor-settings',
    }
  )
);

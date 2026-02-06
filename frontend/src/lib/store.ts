import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  jlptLevel: number | null; // 1 for N1, 5 for N5
  setJlptLevel: (level: number) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  // The 'persist' middleware saves the level in the browser 
  // so it doesn't disappear when they refresh the page!
  persist(
    (set) => ({
      jlptLevel: null,
      setJlptLevel: (level) => set({ jlptLevel: level }),
      reset: () => set({ jlptLevel: null }),
    }),
    {
      name: 'user-japanese-level', // unique name for storage
    }
  )
);
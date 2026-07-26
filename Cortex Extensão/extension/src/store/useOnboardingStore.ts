import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OnboardingData } from '../types';

interface OnboardingStore {
  step: number;
  data: Partial<OnboardingData>;
  user: any | null;
  _hasHydrated: boolean;
  setStep: (step: number) => void;
  updateData: (data: Partial<OnboardingData>) => void;
  setUser: (user: any | null) => void;
  setHasHydrated: (state: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// Storage customizado para chrome.storage.local
const chromeStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const result = await chrome.storage.local.get(name);
    return result[name] ? JSON.stringify(result[name]) : null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await chrome.storage.local.set({ [name]: JSON.parse(value) });
  },
  removeItem: async (name: string): Promise<void> => {
    await chrome.storage.local.remove(name);
  },
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      step: 1,
      user: null,
      _hasHydrated: false,
      data: {
        routine: {
          works: false,
          fullTimeStudent: false,
          hasChildren: false,
          peakEnergyTime: 'Manhã',
          freeDays: [],
        },
      },
      setStep: (step) => set({ step }),
      updateData: (newData) => set((state) => ({ 
        data: { ...state.data, ...newData } 
      })),
      setUser: (user) => set({ user }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
      reset: () => set({ 
        step: 1, 
        user: null,
        data: {
          routine: {
            works: false,
            fullTimeStudent: false,
            hasChildren: false,
            peakEnergyTime: 'Manhã',
            freeDays: [],
          },
        }
      }),
    }),
    {
      name: 'cortex-onboarding-storage',
      storage: createJSONStorage(() => chromeStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

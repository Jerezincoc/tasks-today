import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PreferencesState {
  useCase: 'pessoal' | 'trabalho' | 'ambos';
  useDeadlines: boolean;
  complexity: 'simples' | 'avancado';
  defaultView: 'lista' | 'kanban' | 'calendario';
  theme: 'claro' | 'escuro' | 'sistema' | 'alto-contraste';
  completedRule: 'manter' | 'arquivar_7d' | 'deletar_7d';
  onboardingCompleted: boolean;
  
  setPreferences: (prefs: Partial<PreferencesState>) => void;
  completeOnboarding: () => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      useCase: 'pessoal',
      useDeadlines: true,
      complexity: 'simples',
      defaultView: 'lista',
      theme: 'sistema',
      completedRule: 'manter',
      onboardingCompleted: false,

      setPreferences: (prefs) => set((state) => ({ ...state, ...prefs })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
    }),
    {
      name: 'tasks-preferences-storage', // name of the item in the storage (must be unique)
    }
  )
);

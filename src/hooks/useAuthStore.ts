import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  firstName: string;
  lastName: string;
  nickname?: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (profileData: UserProfile) => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  updateProfile: async (profileData) => {
    const { session } = get();
    if (!session?.access_token) return;

    try {
      // Bate no nosso Backend Express na porta 4000 (Proxy Cloud) em vez de no Supabase puro
      const response = await fetch('http://localhost:4000/api/profiles/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar perfil no backend');
      }

      const result = await response.json();
      set({ profile: result.data });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  initializeAuth: () => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        // Mocking para o momento ou pode buscar profile no futuro se criarmos GET /backend/profiles
        // Por ora, confia no estado do usuario ou seta vazio
      }
      set({ loading: false });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
    });
  }
}));

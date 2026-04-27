import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  firstName: string;
  lastName: string;
  nickname?: string;
  force_password_change?: boolean;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  mustChangePassword: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setMustChangePassword: (must: boolean) => void;
  updateProfile: (profileData: UserProfile) => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  mustChangePassword: false,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setMustChangePassword: (mustChangePassword) => set({ mustChangePassword }),

  updateProfile: async (profileData) => {
    const { session } = get();
    if (!session?.access_token) return;

    try {
      const response = await fetch('/api/profiles/update', {
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
      set({ profile: { ...get().profile, ...result.data } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  initializeAuth: () => {
    const fetchProfile = async (sessionParam: Session) => {
      try {
        const response = await fetch('/api/profiles/me', {
           headers: { 'Authorization': `Bearer ${sessionParam.access_token}` }
        });
        if (response.ok) {
           const result = await response.json();
           const pData = result.data;
           if (pData) {
             set({ 
               profile: {
                 firstName: pData.first_name,
                 lastName: pData.last_name,
                 nickname: pData.nickname,
               },
               mustChangePassword: pData.force_password_change === true
             });
           }
        }
      } catch (e) {
        console.error("Erro consultando perfil no Proxy", e);
      }
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
         await fetchProfile(session);
      }
      set({ loading: false });
    });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
      if (session?.user && _event === 'SIGNED_IN') {
         await fetchProfile(session);
      } else if (_event === 'SIGNED_OUT') {
         set({ profile: null, mustChangePassword: false });
      }
    });
  }
}));

import { create } from 'zustand';

export type RelationshipType = 'Parent' | 'Relative' | 'Cousin' | 'Friend' | 'Partner';

export interface UserProfile {
  id: string;
  nickname: string;
  relationship_type: RelationshipType;
  is_superadmin: boolean;
  onboarding_complete: boolean;
  priority_score: number;
}

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) => set((state) => ({ 
    profile: state.profile ? { ...state.profile, ...updates } : null 
  })),
}));

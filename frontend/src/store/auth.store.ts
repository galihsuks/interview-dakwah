import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '../interfaces/auth';
import type { Nullable } from '../interfaces/common';

interface AuthState {
  token: string;
  user: Nullable<User>;
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: '',
      user: null,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: '', user: null }),
    }),
    {
      name: 'sales-auth',
    },
  ),
);

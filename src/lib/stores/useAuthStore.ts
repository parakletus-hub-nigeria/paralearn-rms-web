import { create } from "zustand";

type UserState = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  accessToken?: string | null;
};

type AuthStore = {
  user: UserState | null;
  setUser: (u: UserState | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
  clear: () => set({ user: null }),
}));

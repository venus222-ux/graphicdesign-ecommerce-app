// src/store/useStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "../types";

interface StoreState {
  token: string | null;
  role: Role | null;
  user: User | null;
  isAuth: boolean;
  initialized: boolean;
  theme: "light" | "dark";

  setAuth: (token: string, role: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setInitialized: (value: boolean) => void;
  toggleTheme: () => void;
  startTokenRefreshLoop: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // ← Changed to (set) only — no unused 'get'
      token: null,
      role: null,
      user: null,
      isAuth: false,
      initialized: false,
      theme: "light",

      setAuth: (token: string, role: string) => {
        const validRole: Role | null = ["user", "moderator", "admin"].includes(
          role,
        )
          ? (role as Role)
          : null;

        set({
          token,
          role: validRole,
          isAuth: !!validRole && !!token,
        });
      },

      setUser: (user: User) => set({ user }),

      logout: () =>
        set({
          token: null,
          role: null,
          user: null,
          isAuth: false,
        }),

      setInitialized: (value: boolean) => set({ initialized: value }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),

      // Token refresh loop (ready for future implementation)
      startTokenRefreshLoop: () => {
        console.log("🔄 Token refresh loop started");

        // TODO: Add your real refresh logic here later
        // Example:
        // const interval = setInterval(async () => {
        //   try {
        //     const res = await refreshToken();
        //     useStore.getState().setAuth(res.data.token, res.data.role);
        //   } catch {
        //     useStore.getState().logout();
        //   }
        // }, 14 * 60 * 1000);
      },
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        user: state.user,
        theme: state.theme,
      }),
    },
  ),
);

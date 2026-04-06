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
      token: null,
      role: null,
      user: null,
      isAuth: false,
      initialized: false,
      theme: "light",

      setAuth: (token: string, role: string) => {
        // 🔥 normalize role: lowercase + trim
        const normalizedRole = role?.toLowerCase().trim();
        const validRole: Role | null = ["user", "moderator", "admin"].includes(
          normalizedRole,
        )
          ? (normalizedRole as Role)
          : null;

        set({
          token,
          role: validRole,
          isAuth: !!token && !!validRole,
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

      startTokenRefreshLoop: () => {
        console.log("🔄 Token refresh loop started");
        // aici poți adăuga logica reală de refresh token
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

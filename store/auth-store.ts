import { create } from "zustand";
import type { Role } from "@/types";

interface AuthState {
  token: string | null;
  email: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  setAuth: (token: string, email: string, role: Role) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  email: null,
  role: null,
  isAuthenticated: false,
  setAuth: (token, email, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("role", role);
    set({ token, email, role, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    set({ token: null, email: null, role: null, isAuthenticated: false });
  },
  hydrate: () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role") as Role | null;
    if (token && email && role) {
      set({ token, email, role, isAuthenticated: true });
    }
  },
}));

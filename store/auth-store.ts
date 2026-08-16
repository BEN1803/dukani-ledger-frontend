import { create } from "zustand";
import type { Role } from "@/types";

const VALID_ROLES: Role[] = ["OWNER", "WORKER", "ADMIN"];

const isValidRole = (role: unknown): role is Role =>
  typeof role === "string" && VALID_ROLES.includes(role as Role);

interface AuthState {
  token: string | null;
  email: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  setAuth: (token: string, email: string, role: Role | null) => void;
  setRole: (role: Role) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  email: null,
  role: null,
  isAuthenticated: false,
  setAuth: (token, email, role) => {
    const safeRole = isValidRole(role) ? role : null;
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    if (safeRole) {
      localStorage.setItem("role", safeRole);
    } else {
      localStorage.removeItem("role");
    }
    set({ token, email, role: safeRole, isAuthenticated: !!token && !!email });
  },
  setRole: (role) => {
    if (!isValidRole(role)) return;
    localStorage.setItem("role", role);
    set({ role });
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
    const storedRole = localStorage.getItem("role");
    const role = isValidRole(storedRole) ? storedRole : null;
    if (token && email) {
      set({ token, email, role, isAuthenticated: true });
    }
  },
}));

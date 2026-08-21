import { create } from "zustand";
import type { BusinessResponse, Role } from "@/types";

const VALID_ROLES: Role[] = ["OWNER", "WORKER", "ADMIN"];

const BUSINESS_KEY = "business";

const isValidRole = (role: unknown): role is Role =>
  typeof role === "string" && VALID_ROLES.includes(role as Role);

const loadBusiness = (): BusinessResponse | null => {
  try {
    const raw = localStorage.getItem(BUSINESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && typeof parsed.id === "number") {
      return parsed as BusinessResponse;
    }
    return null;
  } catch {
    return null;
  }
};

interface AuthState {
  token: string | null;
  email: string | null;
  role: Role | null;
  business: BusinessResponse | null;
  isAuthenticated: boolean;
  setAuth: (token: string, email: string, role: Role | null) => void;
  setRole: (role: Role) => void;
  setBusiness: (business: BusinessResponse) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  email: null,
  role: null,
  business: null,
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
  setBusiness: (business) => {
    localStorage.setItem(BUSINESS_KEY, JSON.stringify(business));
    set({ business });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem(BUSINESS_KEY);
    set({ token: null, email: null, role: null, business: null, isAuthenticated: false });
  },
  hydrate: () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    const role = isValidRole(storedRole) ? storedRole : null;
    const business = loadBusiness();
    if (token && email) {
      set({ token, email, role, business, isAuthenticated: true });
    }
  },
}));

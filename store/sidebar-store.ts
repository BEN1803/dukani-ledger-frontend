import { create } from "zustand";

interface SidebarState {
  open: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  open: true,
  mobileOpen: false,
  toggle: () => set((state) => ({ open: !state.open })),
  setMobileOpen: (open) => set({ mobileOpen: open }),
}));

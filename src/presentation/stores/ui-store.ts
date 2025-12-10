import { create } from "zustand";

interface UIState {
  sidebarExpanded: boolean;
  sidebarMobileOpen: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  setSidebarMobileOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarExpanded: true,
  sidebarMobileOpen: false,
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
}));

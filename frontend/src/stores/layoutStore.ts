import { create } from 'zustand';

interface LayoutStore {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMobileOpen: (open: boolean) => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  toggleSidebar: () =>
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    })),
  setSidebarCollapsed: (collapsed: boolean) =>
    set(() => ({
      sidebarCollapsed: collapsed,
    })),
  setSidebarMobileOpen: (open: boolean) =>
    set(() => ({
      sidebarMobileOpen: open,
    })),
}));

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (type: ToastType, title: string, message?: string) => string;
  dismiss: (id: string) => void;
}

let _seq = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (type, title, message) => {
    const id = `toast-${++_seq}`;
    set((s) => ({ toasts: [...s.toasts.slice(-4), { id, type, title, message }] }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Call outside React components (e.g. in API handlers). */
export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().push('success', title, message),
  error: (title: string, message?: string) =>
    useToastStore.getState().push('error', title, message),
  warning: (title: string, message?: string) =>
    useToastStore.getState().push('warning', title, message),
  info: (title: string, message?: string) => useToastStore.getState().push('info', title, message),
};

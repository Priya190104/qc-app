'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, type ToastItem } from '@/stores/toastStore';

const CFG = {
  success: {
    Icon: CheckCircle2,
    wrap: 'bg-green-50 border-green-200',
    icon: 'text-green-500',
    title: 'text-green-900',
    msg: 'text-green-700',
  },
  error: {
    Icon: XCircle,
    wrap: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-900',
    msg: 'text-red-700',
  },
  warning: {
    Icon: AlertTriangle,
    wrap: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-500',
    title: 'text-amber-900',
    msg: 'text-amber-700',
  },
  info: {
    Icon: Info,
    wrap: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-900',
    msg: 'text-blue-700',
  },
} as const;

function ToastCard({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const c = CFG[item.type];
  const { Icon } = c;

  // Auto-dismiss after 4.5 s
  useEffect(() => {
    const t = setTimeout(() => dismiss(item.id), 4500);
    return () => clearTimeout(t);
  }, [item.id, dismiss]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg shadow-black/5 min-w-[280px] max-w-sm ${c.wrap}`}
      role="alert"
    >
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${c.icon}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${c.title}`}>{item.title}</p>
        {item.message && <p className={`text-xs mt-0.5 leading-snug ${c.msg}`}>{item.message}</p>}
      </div>
      <button
        onClick={() => dismiss(item.id)}
        className={`shrink-0 mt-0.5 opacity-50 hover:opacity-100 transition-opacity ${c.icon}`}
        aria-label="Tutup notifikasi"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/** Drop this once inside your layout — it renders all active toasts. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[90] flex flex-col gap-2 items-end pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard item={t} />
        </div>
      ))}
    </div>
  );
}

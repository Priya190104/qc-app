import React from 'react';
import { getStatusConfig } from '@/lib/constants/status';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium leading-none ${config.bg} ${config.color} ${sizeClass}`}
    >
      {config.label}
    </span>
  );
}

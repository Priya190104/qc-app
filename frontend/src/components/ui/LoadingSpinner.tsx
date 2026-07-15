import React from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  /** Ukuran spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Pesan teks di bawah spinner (opsional) */
  label?: string;
  /** Tampilkan sebagai full-page centered loader */
  fullPage?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-10 w-10 border-4',
};

export function LoadingSpinner({
  size = 'md',
  label,
  fullPage = false,
  className,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={clsx(
          'rounded-full border-gray-200 border-t-blue-600 animate-spin',
          sizeMap[size]
        )}
        role="status"
        aria-label={label ?? 'Memuat...'}
      />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">{spinner}</div>
    );
  }

  return spinner;
}

/** Centered loader untuk section/panel (bukan full-page) */
export function SectionLoader({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <LoadingSpinner size="md" label={label ?? 'Memuat data...'} />
    </div>
  );
}

export default LoadingSpinner;

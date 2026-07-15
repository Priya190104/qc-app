import React from 'react';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
  cols: number;
  title?: string;
  description?: string;
}

export function EmptyState({
  cols,
  title = 'Tidak ada berkas ditemukan',
  description,
}: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={cols}>
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <FileX className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {description && (
            <p className="mt-1 text-xs text-gray-400 max-w-xs leading-relaxed">{description}</p>
          )}
        </div>
      </td>
    </tr>
  );
}

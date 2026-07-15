import React from 'react';

interface TableSkeletonProps {
  cols: number;
  rows?: number;
}

const COL_WIDTHS = [24, 90, 110, 72, 100, 100, 80, 60, 56];

export function TableSkeleton({ cols, rows = 6 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-b border-gray-100 last:border-0">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <td key={colIdx} className="px-3 py-3">
              <div
                className="h-3 bg-gray-200 rounded animate-pulse"
                style={{ width: `${COL_WIDTHS[colIdx] ?? 80}px` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

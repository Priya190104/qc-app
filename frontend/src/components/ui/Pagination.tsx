'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [1];

    if (currentPage > 3) pages.push('ellipsis-start');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push('ellipsis-end');

    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const btnBase =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:pointer-events-none';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 py-1">
      {/* Info text */}
      <p className="text-xs text-gray-500 tabular-nums">
        Menampilkan{' '}
        <span className="font-semibold text-gray-700">
          {startItem}–{endItem}
        </span>{' '}
        dari <span className="font-semibold text-gray-700">{totalItems}</span> data
        {totalPages > 1 && (
          <span className="ml-2 text-gray-400">
            · Halaman {currentPage} / {totalPages}
          </span>
        )}
      </p>

      {/* Controls */}
      {totalPages > 1 && (
        <nav aria-label="Navigasi halaman" className="flex items-center gap-1">
          {/* Previous */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Halaman sebelumnya"
            className={`${btnBase} h-8 w-8 border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40`}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((page) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <span
                  key={page}
                  className="inline-flex items-center justify-center w-8 h-8 text-xs text-gray-400 select-none"
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-label={`Halaman ${page}`}
                aria-current={isActive ? 'page' : undefined}
                className={`${btnBase} h-8 min-w-[2rem] px-2 text-xs ${
                  isActive
                    ? 'bg-blue-600 text-white border border-blue-600 shadow-sm'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {page}
              </button>
            );
          })}

          {/* Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Halaman berikutnya"
            className={`${btnBase} h-8 w-8 border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40`}
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
};

export { Pagination };
export default Pagination;

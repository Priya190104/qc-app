'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className = '',
}: PageHeaderProps) {
  const hasBreadcrumbs = breadcrumbs && breadcrumbs.length > 0;

  return (
    <div className={`border-b border-gray-200 pb-5 mb-6 ${className}`}>
      {/* Breadcrumb navigation */}
      {hasBreadcrumbs && (
        <nav aria-label="Breadcrumb" className="mb-2.5">
          <ol className="flex items-center flex-wrap gap-y-1 text-sm leading-none">
            <li className="flex items-center">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 rounded-sm"
                aria-label="Dashboard"
              >
                <Home className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </li>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={index} className="flex items-center">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 mx-1" aria-hidden="true" />
                  {isLast || !crumb.href ? (
                    <span
                      className={isLast ? 'text-gray-700 font-medium' : 'text-gray-500'}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 rounded-sm"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Title + actions row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] font-semibold text-gray-900 leading-tight tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 leading-relaxed">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2.5 flex-wrap shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

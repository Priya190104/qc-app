'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Alert, PageHeader, SectionLoader } from '@/components/ui';
import type { BreadcrumbItem } from '@/components/ui';

export type TabType = 'update' | 'detail' | 'history';

interface BerkasDetailLayoutProps {
  berkas: any | null;
  loading: boolean;
  error: string | null;
  success?: string | null;
  backUrl: string;
  backLabel?: string;
  pageTitle: string;
  breadcrumbs?: BreadcrumbItem[];
  updateTabLabel?: string;
  children: React.ReactNode; // Tab Pembaruan Data (custom per proses)
  detailTab: React.ReactNode; // Tab Detail Data
  historyTab: React.ReactNode; // Tab History
  hideUpdateTab?: boolean; // Option untuk hide tab pembaruan
}

export default function BerkasDetailLayout({
  berkas,
  loading,
  error,
  success,
  backUrl,
  backLabel,
  pageTitle,
  breadcrumbs,
  updateTabLabel = 'Perbarui Data',
  children,
  detailTab,
  historyTab,
  hideUpdateTab = false,
}: BerkasDetailLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>(hideUpdateTab ? 'detail' : 'update');

  if (loading) {
    return <SectionLoader label="Memuat data berkas..." />;
  }

  if (!berkas) {
    return (
      <div className="space-y-6">
        <Alert type="error" title="Error" message="Berkas tidak ditemukan" />
        <Link href={backUrl}>
          <button className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← {backLabel ?? 'Kembali'}
          </button>
        </Link>
      </div>
    );
  }

  const resolvedBreadcrumbs: BreadcrumbItem[] = breadcrumbs ?? [
    { label: backLabel ?? 'Kembali', href: backUrl },
    { label: pageTitle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title={pageTitle} breadcrumbs={resolvedBreadcrumbs} />

      {/* Alerts */}
      {error && <Alert type="error" title="Error" message={error} />}
      {success && <Alert type="success" title="Success" message={success} />}

      {/* Tabs Container */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {!hideUpdateTab && (
              <button
                onClick={() => setActiveTab('update')}
                className={`${
                  activeTab === 'update'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {updateTabLabel}
              </button>
            )}
            <button
              onClick={() => setActiveTab('detail')}
              className={`${
                activeTab === 'detail'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Detail Berkas
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              History Berkas
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'update' && !hideUpdateTab && children}
          {activeTab === 'detail' && detailTab}
          {activeTab === 'history' && historyTab}
        </div>
      </div>
    </div>
  );
}

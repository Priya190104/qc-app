'use client';

import React from 'react';

interface BerkasHistory {
  id: string;
  berkasId: string;
  oldStatus?: string;
  newStatus?: string;
  reason?: string;
  changedAt: string;
}

interface BerkasHistoryTabProps {
  history?: BerkasHistory[];
}

export default function BerkasHistoryTab({ history }: BerkasHistoryTabProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-5xl mb-4">📋</div>
        <p className="text-gray-500 text-lg">Tidak ada history perubahan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {history.map((item, itemIdx) => (
            <li key={item.id}>
              <div className="relative pb-8">
                {itemIdx !== history.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                      <span className="text-white text-xs">📋</span>
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900">
                        Status diubah dari{' '}
                        <span className="font-medium">{item.oldStatus || '-'}</span> ke{' '}
                        <span className="font-medium">{item.newStatus || '-'}</span>
                      </p>
                      {item.reason && (
                        <p className="mt-1 text-sm text-gray-500">Alasan: {item.reason}</p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      {new Date(item.changedAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

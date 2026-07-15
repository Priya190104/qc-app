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

// Status label map for the history tab
const STATUS_LABELS: Record<string, string> = {
  DIBUAT: 'Dibuat',
  DI_OPERATOR_DATA_UKUR: 'Operator Data Ukur',
  DI_PETUGAS_UKUR: 'Petugas Ukur',
  DI_OPERATOR_DATA_PEMETAAN: 'Operator Data Pemetaan',
  DI_PETUGAS_PEMETAAN: 'Petugas Pemetaan',
  PEMILIHAN_KKS: 'Pemilihan KKS',
  DI_KKS: 'Di KKS',
  REVISI_KKS: 'Revisi KKS',
  DI_KEPALA_SEKSI: 'Kepala Seksi',
  REVISI_KASI: 'Revisi Kasi',
  SELESAI: 'Selesai',
  DITUTUP: 'Ditutup',
};

const STATUS_BADGE: Record<string, string> = {
  DIBUAT: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300',
  DI_OPERATOR_DATA_UKUR: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300',
  DI_PETUGAS_UKUR: 'bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-300',
  DI_OPERATOR_DATA_PEMETAAN: 'bg-cyan-100 text-cyan-700 ring-1 ring-inset ring-cyan-300',
  DI_PETUGAS_PEMETAAN: 'bg-teal-100 text-teal-700 ring-1 ring-inset ring-teal-300',
  PEMILIHAN_KKS: 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-300',
  DI_KKS: 'bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-300',
  REVISI_KKS: 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-300',
  DI_KEPALA_SEKSI: 'bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-300',
  REVISI_KASI: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300',
  SELESAI: 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-300',
  DITUTUP: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-300',
};

const STATUS_DOT: Record<string, string> = {
  DIBUAT: 'bg-slate-400',
  DI_OPERATOR_DATA_UKUR: 'bg-blue-500',
  DI_PETUGAS_UKUR: 'bg-indigo-500',
  DI_OPERATOR_DATA_PEMETAAN: 'bg-cyan-500',
  DI_PETUGAS_PEMETAAN: 'bg-teal-500',
  PEMILIHAN_KKS: 'bg-amber-400',
  DI_KKS: 'bg-purple-500',
  REVISI_KKS: 'bg-orange-500',
  DI_KEPALA_SEKSI: 'bg-violet-500',
  REVISI_KASI: 'bg-red-400',
  SELESAI: 'bg-green-500',
  DITUTUP: 'bg-red-600',
};

function getBadge(status?: string) {
  return STATUS_BADGE[status ?? ''] ?? 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-300';
}
function getDot(status?: string) {
  return STATUS_DOT[status ?? ''] ?? 'bg-gray-400';
}
function getLabel(status?: string) {
  return STATUS_LABELS[status ?? ''] ?? status ?? '—';
}

export default function BerkasHistoryTab({ history }: BerkasHistoryTabProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-500">Belum ada riwayat perubahan</p>
        <p className="text-xs text-gray-400 mt-1">Perubahan status berkas akan tercatat di sini</p>
      </div>
    );
  }

  return (
    <ol>
      {history.map((item, idx) => {
        const isLast = idx === history.length - 1;
        const isDone = item.newStatus === 'SELESAI';
        const isClosed = item.newStatus === 'DITUTUP';
        const isRevision = item.newStatus === 'REVISI_KKS' || item.newStatus === 'REVISI_KASI';
        const dotColor = getDot(item.newStatus);

        return (
          <li key={item.id} className="relative pl-11 pb-8 last:pb-0">
            {!isLast && (
              <span
                className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-200"
                aria-hidden="true"
              />
            )}

            {/* Status node */}
            <span
              className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white ${dotColor}`}
            >
              {isDone ? (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : isClosed ? (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : isRevision ? (
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              )}
            </span>

            <div className="pt-0.5">
              {/* Status transition */}
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {item.oldStatus && (
                  <>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadge(item.oldStatus)}`}
                    >
                      {getLabel(item.oldStatus)}
                    </span>
                    <svg
                      className="w-3 h-3 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${getBadge(item.newStatus)}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  {getLabel(item.newStatus)}
                </span>
              </div>

              {/* Reason */}
              {item.reason && (
                <div className="mt-1.5 px-3 py-2 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600 italic">{item.reason}</p>
                </div>
              )}

              {/* Timestamp */}
              <time className="mt-1.5 block text-xs text-gray-400">
                {new Date(item.changedAt).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

'use client';

import React, { useState, useEffect, useMemo, useCallback, useId, useRef } from 'react';
import { PageHeader } from '@/components/ui';
import { apiClient } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UmuxRawResponse {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}

interface UmuxEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userRole: string;
  responses: UmuxRawResponse;
  score: number; // 0–100
  submittedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const QUESTIONS = [
  { key: 'q1' as const, label: 'UMUX1', short: 'Kebutuhan kerja', polarity: 'positive' as const },
  { key: 'q2' as const, label: 'UMUX2', short: 'Kesulitan', polarity: 'negative' as const },
  { key: 'q3' as const, label: 'UMUX3', short: 'Kemudahan', polarity: 'positive' as const },
  { key: 'q4' as const, label: 'UMUX4', short: 'Bthn. Bantuan', polarity: 'negative' as const },
];

const FULL_QUESTIONS: Record<string, string> = {
  q1: 'Sistem ini memenuhi kebutuhan pekerjaan saya.',
  q2: 'Saya merasa kesulitan saat menggunakan sistem ini.',
  q3: 'Sistem ini mudah digunakan.',
  q4: 'Saya membutuhkan bantuan teknis untuk menggunakan sistem ini.',
};

const LIKERT_LABELS: Record<number, string> = {
  1: 'Sangat Tidak Setuju',
  2: 'Tidak Setuju',
  3: 'Agak Tidak Setuju',
  4: 'Netral',
  5: 'Agak Setuju',
  6: 'Setuju',
  7: 'Sangat Setuju',
};

const ROLE_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  administrator: {
    label: 'Administrator',
    badge: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    dot: 'bg-violet-500',
  },
  'operator-data-berkas': {
    label: 'Op. Data Berkas',
    badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    dot: 'bg-blue-500',
  },
  'operator-data-pemetaan': {
    label: 'Op. Data Pemetaan',
    badge: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
    dot: 'bg-cyan-500',
  },
  'operator-data-ukur': {
    label: 'Op. Data Ukur',
    badge: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    dot: 'bg-sky-500',
  },
  'quality-control-officer': {
    label: 'Quality Control',
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    dot: 'bg-amber-500',
  },
};

const DEFAULT_ROLE_CFG = {
  label: 'User',
  badge: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  dot: 'bg-gray-400',
};

const PAGE_SIZE = 15;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * UMUX-Lite score (0–100).
 * Positive items (Q1, Q3): scored directly.
 * Negative items (Q2, Q4): reverse scored (8 − value).
 * Formula: ((Q1 + Q3 + (8−Q2) + (8−Q4)) − 4) / 24 × 100
 */
function calcUmux(r: UmuxRawResponse): number {
  const sum = r.q1 + r.q3 + (8 - r.q2) + (8 - r.q4);
  return Math.round(((sum - 4) / 24) * 100);
}

function getRoleCfg(role: string) {
  return ROLE_CONFIG[role] ?? DEFAULT_ROLE_CFG;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function fmtMonthLabel(d: Date): string {
  return d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
}

function scoreRingClass(score: number): string {
  if (score >= 85) return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  if (score >= 70) return 'bg-teal-50 text-teal-700 ring-1 ring-teal-200';
  if (score >= 50) return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
  return 'bg-red-50 text-red-700 ring-1 ring-red-200';
}

function scoreBarClass(score: number): string {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 70) return 'bg-teal-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function scoreLabel(score: number): string {
  if (score >= 85) return 'Sangat Puas';
  if (score >= 70) return 'Puas';
  if (score >= 50) return 'Cukup Puas';
  return 'Tidak Puas';
}

// ─── QuestionBarChart ─────────────────────────────────────────────────────────

function QuestionBarChart({ avgs }: { avgs: UmuxRawResponse }) {
  const W = 400;
  const H = 200;
  const pad = { top: 28, right: 24, bottom: 68, left: 36 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxY = 7;

  const cols = [
    { label: 'UMUX1', sub: 'Kebutuhan kerja', value: avgs.q1, negative: false },
    { label: 'UMUX2', sub: 'Kesulitan', value: avgs.q2, negative: true },
    { label: 'UMUX3', sub: 'Kemudahan', value: avgs.q3, negative: false },
    { label: 'UMUX4', sub: 'Bthn. Bantuan', value: avgs.q4, negative: true },
  ];

  const slotW = chartW / cols.length;
  const barW = Math.max(slotW * 0.52, 28);
  const hasData = cols.some((c) => c.value > 0);

  const yScr = (v: number) => pad.top + chartH - ((v - 1) / (maxY - 1)) * chartH;

  if (!hasData) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-label="Belum ada data">
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={13} fill="#9ca3af">
          Belum ada data
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Rata-rata skor per pertanyaan UMUX (skala 1–7)"
    >
      {/* Horizontal gridlines */}
      {[1, 2, 3, 4, 5, 6, 7].map((v) => {
        const y = yScr(v);
        const isNeutral = v === 4;
        return (
          <g key={v}>
            <line
              x1={pad.left}
              y1={y}
              x2={W - pad.right}
              y2={y}
              stroke={isNeutral ? '#cbd5e1' : '#f1f5f9'}
              strokeWidth={isNeutral ? 1.5 : 1}
              strokeDasharray={isNeutral ? '4 3' : undefined}
            />
            <text x={pad.left - 5} y={y + 3.5} textAnchor="end" fontSize={9} fill="#9ca3af">
              {v}
            </text>
          </g>
        );
      })}
      {/* Neutral label */}
      <text x={W - pad.right + 2} y={yScr(4) + 3.5} fontSize={8} fill="#9ca3af">
        N
      </text>

      {/* Bars */}
      {cols.map((col, i) => {
        const slotX = pad.left + i * slotW;
        const barX = slotX + (slotW - barW) / 2;
        const rawH = col.value > 0 ? ((col.value - 1) / (maxY - 1)) * chartH : 0;
        const barH = Math.max(rawH, 2);
        const barY = yScr(Math.max(col.value, 1));
        const fill = col.negative ? '#93c5fd' : '#2563eb';
        const cx = slotX + slotW / 2;

        return (
          <g key={col.label}>
            <rect x={barX} y={barY} width={barW} height={barH} rx={3} fill={fill} />
            {col.value > 0 && (
              <text
                x={cx}
                y={barY - 6}
                textAnchor="middle"
                fontSize={11}
                fill="#1e293b"
                fontWeight="600"
              >
                {col.value.toFixed(1)}
              </text>
            )}
            <text
              x={cx}
              y={H - 44}
              textAnchor="middle"
              fontSize={11}
              fill="#374151"
              fontWeight="500"
            >
              {col.label}
            </text>
            <text x={cx} y={H - 28} textAnchor="middle" fontSize={9} fill="#9ca3af">
              {col.sub}
            </text>
            {col.negative && (
              <text x={cx} y={H - 12} textAnchor="middle" fontSize={8} fill="#bfdbfe">
                ↓ lebih baik
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── TrendLineChart ───────────────────────────────────────────────────────────

interface MonthPoint {
  month: string;
  avgScore: number | null;
  count: number;
}

function TrendLineChart({ data }: { data: MonthPoint[] }) {
  const W = 400;
  const H = 200;
  const pad = { top: 28, right: 28, bottom: 52, left: 44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const n = data.length;

  const getX = (i: number) => pad.left + (n > 1 ? (i / (n - 1)) * chartW : chartW / 2);
  const getY = (score: number) => pad.top + chartH - (score / 100) * chartH;

  const validPts = data
    .map((d, i) =>
      d.avgScore !== null ? { ...d, x: getX(i), y: getY(d.avgScore), avgScore: d.avgScore } : null
    )
    .filter(Boolean) as (MonthPoint & {
    x: number;
    y: number;
    avgScore: number;
  })[];

  const pathD = validPts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Tren skor UMUX 6 bulan terakhir"
    >
      {/* Score zone background bands */}
      <rect
        x={pad.left}
        y={getY(100)}
        width={chartW}
        height={getY(85) - getY(100)}
        fill="#f0fdf4"
      />
      <rect x={pad.left} y={getY(85)} width={chartW} height={getY(70) - getY(85)} fill="#f0fdfa" />
      <rect x={pad.left} y={getY(70)} width={chartW} height={getY(50) - getY(70)} fill="#fffbeb" />
      <rect x={pad.left} y={getY(50)} width={chartW} height={getY(0) - getY(50)} fill="#fff7f7" />

      {/* Gridlines */}
      {[0, 50, 70, 85, 100].map((v) => {
        const y = getY(v);
        return (
          <g key={v}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#e2e8f0" strokeWidth={1} />
            <text x={pad.left - 5} y={y + 3.5} textAnchor="end" fontSize={9} fill="#9ca3af">
              {v}
            </text>
          </g>
        );
      })}

      {/* Zone labels */}
      <text x={W - pad.right + 2} y={getY(92) + 3} fontSize={8} fill="#6ee7b7">
        SP
      </text>
      <text x={W - pad.right + 2} y={getY(77) + 3} fontSize={8} fill="#5eead4">
        P
      </text>
      <text x={W - pad.right + 2} y={getY(60) + 3} fontSize={8} fill="#fcd34d">
        CP
      </text>
      <text x={W - pad.right + 2} y={getY(25) + 3} fontSize={8} fill="#fca5a5">
        TP
      </text>

      {validPts.length === 0 ? (
        <text x={W / 2} y={H / 2 - 10} textAnchor="middle" fontSize={13} fill="#9ca3af">
          Belum ada data
        </text>
      ) : (
        <>
          {/* Area fill under the line */}
          {validPts.length > 1 && (
            <path
              d={`${pathD} L ${validPts[validPts.length - 1].x.toFixed(1)} ${getY(0).toFixed(1)} L ${validPts[0].x.toFixed(1)} ${getY(0).toFixed(1)} Z`}
              fill="#2563eb"
              fillOpacity={0.06}
            />
          )}
          {/* Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#2563eb"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {/* Points */}
          {validPts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={5} fill="white" stroke="#2563eb" strokeWidth={2.5} />
              <text
                x={p.x}
                y={p.y - 11}
                textAnchor="middle"
                fontSize={11}
                fill="#1e293b"
                fontWeight="600"
              >
                {p.avgScore}
              </text>
            </g>
          ))}
        </>
      )}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <g key={i}>
          <text x={getX(i)} y={H - 24} textAnchor="middle" fontSize={10} fill="#6b7280">
            {d.month}
          </text>
          {d.count > 0 && (
            <text x={getX(i)} y={H - 10} textAnchor="middle" fontSize={8} fill="#9ca3af">
              n={d.count}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ─── DetailModal ──────────────────────────────────────────────────────────────

function DetailModal({ entry, onClose }: { entry: UmuxEntry; onClose: () => void }) {
  const uid = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = `${uid}-title`;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    containerRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const el = containerRef.current;
      if (!el) return;
      const focusable = Array.from(
        el.querySelectorAll<HTMLElement>('button:not([disabled]),[tabindex]:not([tabindex="-1"])')
      );
      if (!focusable.length) return;
      const idx = focusable.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey) {
        if (idx <= 0) {
          e.preventDefault();
          focusable[focusable.length - 1].focus();
        }
      } else {
        if (idx === focusable.length - 1) {
          e.preventDefault();
          focusable[0].focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [onClose]);

  const roleCfg = getRoleCfg(entry.userRole);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-md max-h-[90dvh] flex flex-col outline-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-gray-900">
              Detail Respons UMUX
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <p className="text-sm font-medium text-gray-700">{entry.userName}</p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${roleCfg.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${roleCfg.dot}`} />
                {roleCfg.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup detail"
            className="shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Score band */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Skor UMUX</p>
            <span
              className={`text-2xl font-bold tabular-nums ${
                entry.score >= 85
                  ? 'text-emerald-700'
                  : entry.score >= 70
                    ? 'text-teal-700'
                    : entry.score >= 50
                      ? 'text-amber-700'
                      : 'text-red-600'
              }`}
            >
              {entry.score}
              <span className="text-sm text-gray-400 font-normal ml-0.5">/100</span>
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-none ${scoreBarClass(entry.score)}`}
              style={{ width: `${entry.score}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{fmtDate(entry.submittedAt)}</p>
        </div>

        {/* Answers */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {QUESTIONS.map((q, idx) => {
            const raw = entry.responses[q.key];
            const isNeg = q.polarity === 'negative';
            return (
              <div key={q.key}>
                <p className="text-sm font-medium text-gray-900 mb-2 leading-snug">
                  <span className="text-gray-400 font-normal tabular-nums mr-1.5">{idx + 1}.</span>
                  {FULL_QUESTIONS[q.key]}
                  {isNeg && (
                    <span className="ml-1.5 text-xs text-gray-400 font-normal">(negatif)</span>
                  )}
                </p>
                {/* 7-segment scale */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <span
                      key={n}
                      className={`flex-1 flex items-center justify-center h-7 rounded text-xs font-medium ${
                        n === raw
                          ? isNeg
                            ? 'bg-slate-700 text-white'
                            : 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{LIKERT_LABELS[raw] ?? '—'}</p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Table skeleton ───────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b border-gray-100 animate-pulse">
          <td className="px-4 py-3">
            <div className="space-y-1.5">
              <div className="h-3.5 bg-gray-200 rounded w-28" />
              <div className="h-3 bg-gray-200 rounded w-36" />
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="h-5 bg-gray-200 rounded w-24" />
          </td>
          <td className="px-4 py-3">
            <div className="h-3.5 bg-gray-200 rounded w-28" />
          </td>
          <td className="px-4 py-3">
            <div className="h-5 bg-gray-200 rounded w-10" />
          </td>
          <td className="px-4 py-3">
            <div className="h-5 bg-gray-200 rounded w-12 ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 text-gray-400 py-2">
      <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <p className="text-sm font-medium text-gray-500">
        {hasFilters ? 'Tidak ada hasil yang cocok dengan filter' : 'Belum ada respons UMUX'}
      </p>
      {hasFilters && (
        <button onClick={onClear} className="text-sm text-blue-600 hover:underline">
          Hapus filter
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UmuxResultsPage() {
  const [allEntries, setAllEntries] = useState<UmuxEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<UmuxEntry | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  // ── Data fetch ────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await apiClient.get<any>('/feedback/umux?limit=1000');
      const payload = res.data?.data ?? res.data;
      const raw: any[] = Array.isArray(payload) ? payload : (payload?.data ?? []);

      const entries: UmuxEntry[] = raw.map((item: any) => {
        const r: UmuxRawResponse = {
          q1: Number(item.responses?.q1 ?? 4),
          q2: Number(item.responses?.q2 ?? 4),
          q3: Number(item.responses?.q3 ?? 4),
          q4: Number(item.responses?.q4 ?? 4),
        };
        return {
          id: item.id ?? String(Math.random()),
          userId: item.userId ?? '',
          userName: item.userName ?? item.user?.firstName ?? item.user?.name ?? 'Pengguna',
          userEmail: item.userEmail ?? item.user?.email,
          userRole: item.userRole ?? item.user?.roles?.[0]?.name ?? '',
          responses: r,
          score: typeof item.score === 'number' ? item.score : calcUmux(r),
          submittedAt: item.submittedAt ?? item.createdAt ?? new Date().toISOString(),
        };
      });

      // Newest first
      entries.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setAllEntries(entries);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        // Endpoint not yet implemented — treat as empty dataset
        setAllEntries([]);
      } else {
        setFetchError(e?.response?.data?.message ?? e?.message ?? 'Gagal memuat data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, dateFrom, dateTo]);

  // ── Derived: summary stats (all entries) ──────────────────────────────────

  const summary = useMemo(() => {
    if (!allEntries.length) return null;
    const scores = allEntries.map((e) => e.score);
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    const now = new Date();
    const thisMonth = allEntries.filter((e) => {
      const d = new Date(e.submittedAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return {
      total: allEntries.length,
      avg: Math.round(avg),
      thisMonth,
      lastSubmission: allEntries[0]?.submittedAt ?? null,
    };
  }, [allEntries]);

  // ── Derived: question averages (all entries) ──────────────────────────────

  const questionAvgs = useMemo((): UmuxRawResponse => {
    if (!allEntries.length) return { q1: 0, q2: 0, q3: 0, q4: 0 };
    const n = allEntries.length;
    return {
      q1: allEntries.reduce((s, e) => s + e.responses.q1, 0) / n,
      q2: allEntries.reduce((s, e) => s + e.responses.q2, 0) / n,
      q3: allEntries.reduce((s, e) => s + e.responses.q3, 0) / n,
      q4: allEntries.reduce((s, e) => s + e.responses.q4, 0) / n,
    };
  }, [allEntries]);

  // ── Derived: monthly trend — last 6 months ────────────────────────────────

  const monthlyTrend = useMemo((): MonthPoint[] => {
    const months: MonthPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const bucket = allEntries.filter((e) => {
        const ed = new Date(e.submittedAt);
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
      });
      months.push({
        month: fmtMonthLabel(d),
        avgScore:
          bucket.length > 0
            ? Math.round(bucket.reduce((s, e) => s + e.score, 0) / bucket.length)
            : null,
        count: bucket.length,
      });
    }
    return months;
  }, [allEntries]);

  // ── Derived: filtered + paginated table rows ──────────────────────────────

  const filteredEntries = useMemo(() => {
    return allEntries.filter((e) => {
      const name = e.userName.toLowerCase();
      const email = (e.userEmail ?? '').toLowerCase();
      const term = search.toLowerCase();
      const matchSearch = !search || name.includes(term) || email.includes(term);
      const matchRole = !roleFilter || e.userRole === roleFilter;
      const matchFrom = !dateFrom || new Date(e.submittedAt) >= new Date(dateFrom);
      const matchTo = !dateTo || new Date(e.submittedAt) <= new Date(dateTo + 'T23:59:59');
      return matchSearch && matchRole && matchFrom && matchTo;
    });
  }, [allEntries, search, roleFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const pagedEntries = filteredEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = !!(search || roleFilter || dateFrom || dateTo);

  const clearFilters = useCallback(() => {
    setSearch('');
    setRoleFilter('');
    setDateFrom('');
    setDateTo('');
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      <PageHeader
        title="Hasil Evaluasi UMUX"
        description="Analisis kepuasan pengguna berdasarkan survei UMUX periodik"
      />

      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {fetchError}
        </div>
      )}

      {/* ── Summary strip ── */}
      <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-6 bg-gray-200 rounded w-12" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            ))}
          </div>
        ) : !summary ? (
          <p className="text-sm text-gray-400">Belum ada data survei</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:divide-x sm:divide-gray-200">
            <div>
              <p className="text-2xl font-semibold text-gray-900 leading-none tabular-nums">
                {summary.total}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total Responden</p>
            </div>
            <div className="sm:pl-5">
              <p
                className={`text-2xl font-semibold leading-none tabular-nums ${
                  summary.avg >= 85
                    ? 'text-emerald-700'
                    : summary.avg >= 70
                      ? 'text-teal-700'
                      : summary.avg >= 50
                        ? 'text-amber-700'
                        : 'text-red-600'
                }`}
              >
                {summary.avg}
              </p>
              <p className="text-xs text-gray-400 mt-1">Rata-rata Skor UMUX</p>
            </div>
            <div className="sm:pl-5">
              <p className="text-2xl font-semibold text-gray-900 leading-none tabular-nums">
                {summary.thisMonth}
              </p>
              <p className="text-xs text-gray-400 mt-1">Respons Bulan Ini</p>
            </div>
            <div className="sm:pl-5">
              <p className="text-sm font-semibold text-gray-900 leading-none pt-1 truncate">
                {summary.lastSubmission ? fmtDate(summary.lastSubmission).split(',')[0] : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Terakhir Masuk</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-900">Rata-rata Skor per Pertanyaan</h2>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">Skala Likert 1–7.</p>
          <QuestionBarChart avgs={questionAvgs} />
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
              Pertanyaan positif
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-200 inline-block" />
              Pertanyaan negatif*
            </span>
          </div>
        </div>

        {/* Line chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-900">Tren Skor UMUX per Bulan</h2>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">6 bulan terakhir · Skala 0–100</p>
          <TrendLineChart data={monthlyTrend} />
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded bg-emerald-300 inline-block" />
              85–100 Sangat Puas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded bg-teal-300 inline-block" />
              70–84 Puas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded bg-amber-300 inline-block" />
              50–69 Cukup Puas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded bg-red-200 inline-block" />
              &lt;50 Tidak Puas
            </span>
          </div>
        </div>
      </div>

      {/* ── Filter toolbar ── */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Cari nama atau email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Role</option>
          {Object.entries(ROLE_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>

        {/* Date from */}
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="py-2 px-3 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Dari tanggal"
        />

        {/* Date to */}
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="py-2 px-3 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Sampai tanggal"
        />

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="py-2 px-3 text-sm text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Hapus filter
          </button>
        )}
      </div>

      {/* ── Response table ── */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Daftar Respons</h2>
            {!loading && (
              <p className="text-xs text-gray-400 mt-0.5">
                {filteredEntries.length} respons
                {hasFilters ? ' (terfilter)' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th
                  scope="col"
                  className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  Pengguna
                </th>
                <th
                  scope="col"
                  className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  Tanggal Submit
                </th>
                <th
                  scope="col"
                  className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  Skor
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <TableSkeleton />
              ) : pagedEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
                  </td>
                </tr>
              ) : (
                pagedEntries.map((entry) => {
                  const roleCfg = getRoleCfg(entry.userRole);
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{entry.userName}</p>
                        {entry.userEmail && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {entry.userEmail}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${roleCfg.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${roleCfg.dot}`} />
                          {roleCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {fmtDate(entry.submittedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tabular-nums ${scoreRingClass(entry.score)}`}
                        >
                          {entry.score}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredEntries.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredEntries.length)} dari{' '}
              {filteredEntries.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 transition-colors"
              >
                Sebelumnya
              </button>
              <span className="px-2.5 py-1 text-xs text-gray-500 tabular-nums">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 transition-colors"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}

        {/* Row count footer */}
        {!loading && filteredEntries.length > 0 && filteredEntries.length <= PAGE_SIZE && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 text-right">
            <p className="text-xs text-gray-400">{filteredEntries.length} respons</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedEntry && (
        <DetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </div>
  );
}

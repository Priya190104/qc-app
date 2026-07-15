'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { apiClient } from '@/lib/api';
import { dismissForSession, recordSubmission } from '@/lib/umux-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

type UmuxKey = 'q1' | 'q2' | 'q3' | 'q4';
type Responses = Record<UmuxKey, number | null>;
type ModalMode = 'invitation' | 'survey' | 'thanks' | 'error';

interface UmuxModalProps {
  onClose: () => void;
}

// ─── Survey content ───────────────────────────────────────────────────────────

const QUESTIONS: { id: UmuxKey; text: string }[] = [
  { id: 'q1', text: 'Sistem ini memenuhi kebutuhan pekerjaan saya.' },
  { id: 'q2', text: 'Saya merasa kesulitan saat menggunakan sistem ini.' },
  { id: 'q3', text: 'Sistem ini mudah digunakan.' },
  { id: 'q4', text: 'Saya membutuhkan bantuan teknis untuk menggunakan sistem ini.' },
];

const LIKERT: Record<number, string> = {
  1: 'Sangat Tidak Setuju',
  2: 'Tidak Setuju',
  3: 'Agak Tidak Setuju',
  4: 'Netral',
  5: 'Agak Setuju',
  6: 'Setuju',
  7: 'Sangat Setuju',
};

// ─── Focus trap ───────────────────────────────────────────────────────────────

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, active: boolean) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Save the element that had focus before the modal opened
    previousFocusRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // Move focus into the modal
    const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    focusable[0]?.focus();

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const current = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (current.length === 0) return;
      const idx = current.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey) {
        if (idx <= 0) {
          e.preventDefault();
          current[current.length - 1].focus();
        }
      } else {
        if (idx === current.length - 1) {
          e.preventDefault();
          current[0].focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore focus when the modal closes
      previousFocusRef.current?.focus();
    };
  }, [active, containerRef]);
}

// ─── Likert scale ─────────────────────────────────────────────────────────────

interface LikertScaleProps {
  groupName: string;
  labelId: string;
  value: number | null;
  onChange: (v: number) => void;
}

function LikertScale({ groupName, labelId, value, onChange }: LikertScaleProps) {
  // Arrow-key navigation inside the group
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>, current: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(current + 1, 7);
      onChange(next);
      document
        .querySelector<HTMLInputElement>(`input[name="${groupName}"][value="${next}"]`)
        ?.focus();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(current - 1, 1);
      onChange(prev);
      document
        .querySelector<HTMLInputElement>(`input[name="${groupName}"][value="${prev}"]`)
        ?.focus();
    }
  };

  return (
    <div role="radiogroup" aria-labelledby={labelId} className="mt-3">
      {/* Scale buttons */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => {
          const selected = value === n;
          return (
            <label key={n} className="flex-1 cursor-pointer" title={LIKERT[n]}>
              <input
                type="radio"
                name={groupName}
                value={n}
                checked={selected}
                onChange={() => onChange(n)}
                onKeyDown={(e) => handleKeyDown(e, n)}
                className="sr-only"
                aria-label={`${n} — ${LIKERT[n]}`}
                tabIndex={selected || (value === null && n === 1) ? 0 : -1}
              />
              <span
                className={`flex items-center justify-center h-9 w-full select-none rounded text-sm font-medium transition-colors duration-100 ${
                  selected
                    ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-1'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-hidden="true"
              >
                {n}
              </span>
            </label>
          );
        })}
      </div>
      {/* Anchor labels */}
      <div className="flex justify-between mt-1.5 px-0.5">
        <span className="text-xs text-gray-400">Sangat Tidak Setuju</span>
        <span className="text-xs text-gray-400 text-right">Sangat Setuju</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UmuxModal({ onClose }: UmuxModalProps) {
  const uid = useId();

  const [mode, setMode] = useState<ModalMode>('invitation');
  const [responses, setResponses] = useState<Responses>({
    q1: null,
    q2: null,
    q3: null,
    q4: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false); // drives CSS entry animation

  const surveyContainerRef = useRef<HTMLDivElement>(null);
  const titleId = `${uid}-title`;

  // Activate focus trap only when the survey/thanks modal is open
  useFocusTrap(surveyContainerRef, mode === 'survey' || mode === 'thanks' || mode === 'error');

  // Trigger CSS entry animation on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Global Escape key handler
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') handleRemindLater();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  /** Dismiss the invitation for this session ("Ingatkan Nanti"). */
  const handleRemindLater = useCallback(() => {
    dismissForSession();
    setMounted(false);
    // Wait for the exit animation to finish before removing from the DOM
    setTimeout(onClose, 280);
  }, [onClose]);

  /** Transition from invitation card → survey modal. */
  const handleOpenSurvey = useCallback(() => {
    setMode('survey');
  }, []);

  const handleSetResponse = useCallback((id: UmuxKey, v: number) => {
    setResponses((prev) => ({ ...prev, [id]: v }));
  }, []);

  const answeredCount = Object.values(responses).filter((v) => v !== null).length;
  const allAnswered = answeredCount === 4;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!allAnswered || submitting) return;

    setSubmitting(true);
    try {
      await apiClient.post('/feedback/umux', {
        q1: responses.q1,
        q2: responses.q2,
        q3: responses.q3,
        q4: responses.q4,
      });
      // Only record the 30-day cooldown when the API call actually succeeds
      recordSubmission();
      setMode('thanks');
    } catch {
      setMode('error');
    } finally {
      setSubmitting(false);
    }
  };

  /** Close the thank-you state. */
  const handleDone = useCallback(() => {
    setMounted(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  // ── Render ───────────────────────────────────────────────────────────────────

  // ── A: Invitation card (bottom-right, non-intrusive) ──────────────────────

  if (mode === 'invitation') {
    return (
      <div
        role="complementary"
        aria-label="Undangan survei kepuasan"
        className={[
          'fixed bottom-6 right-6 z-[60] w-80',
          'bg-white border border-gray-200 rounded-xl shadow-lg',
          'transition-all duration-300 ease-out motion-reduce:transition-none',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        ].join(' ')}
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900">Survei Kepuasan</p>
            </div>
            <button
              onClick={handleRemindLater}
              aria-label="Tutup undangan survei"
              className="shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            Bantu kami meningkatkan sistem. Survei singkat ini hanya membutuhkan 1–2 menit.
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleOpenSurvey}
              className="flex-1 py-2 px-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              Isi Survei
            </button>
            <button
              onClick={handleRemindLater}
              className="flex-1 py-2 px-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            >
              Ingatkan Nanti
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── B: Thank-you screen ────────────────────────────────────────────────────

  if (mode === 'thanks') {
    return (
      <div
        className={[
          'fixed inset-0 z-[60] flex items-center justify-center p-4',
          'transition-opacity duration-300 ease-out motion-reduce:transition-none',
          mounted ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        <div className="absolute inset-0 bg-black/30" onClick={handleDone} aria-hidden="true" />
        <div
          ref={surveyContainerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={[
            'relative bg-white border border-gray-200 rounded-xl shadow-xl',
            'max-w-sm w-full p-8 text-center',
            'transition-all duration-300 ease-out motion-reduce:transition-none',
            mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          ].join(' ')}
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 id={titleId} className="text-base font-semibold text-gray-900 mb-2">
            Terima Kasih
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Masukan Anda membantu kami meningkatkan kualitas Sistem QC Berkas.
          </p>
          <button
            onClick={handleDone}
            className="mt-6 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Selesai
          </button>
        </div>
      </div>
    );
  }

  // ── C: Error state ────────────────────────────────────────────────────────

  if (mode === 'error') {
    return (
      <div
        className={[
          'fixed inset-0 z-[60] flex items-center justify-center p-4',
          'transition-opacity duration-300 ease-out motion-reduce:transition-none',
          mounted ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        <div className="absolute inset-0 bg-black/30" onClick={handleDone} aria-hidden="true" />
        <div
          ref={surveyContainerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={[
            'relative bg-white border border-gray-200 rounded-xl shadow-xl',
            'max-w-sm w-full p-8 text-center',
            'transition-all duration-300 ease-out motion-reduce:transition-none',
            mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          ].join(' ')}
        >
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
              />
            </svg>
          </div>
          <h2 id={titleId} className="text-base font-semibold text-gray-900 mb-2">
            Gagal Menyimpan
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Jawaban tidak berhasil disimpan ke server. Pastikan koneksi internet aktif, lalu coba
            lagi.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => setMode('survey')}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              Coba Lagi
            </button>
            <button
              onClick={handleDone}
              className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── D: Survey modal ────────────────────────────────────────────────────────

  return (
    <div
      className={[
        'fixed inset-0 z-[60] flex items-center justify-center p-4',
        'transition-opacity duration-300 ease-out motion-reduce:transition-none',
        mounted ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleRemindLater}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={surveyContainerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          'relative bg-white border border-gray-200 rounded-xl shadow-xl',
          'w-full max-w-lg max-h-[90dvh] flex flex-col',
          'transition-all duration-300 ease-out motion-reduce:transition-none',
          mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-gray-900">
              Survei Kepuasan Pengguna
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">SISTEM QC BERKAS · Evaluasi UMUX</p>
          </div>
          <button
            onClick={handleRemindLater}
            aria-label="Tutup survei"
            className="shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 mt-0.5"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <form id={`${uid}-form`} onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-7">
            <p className="text-sm text-gray-600 leading-relaxed">
              Pilih satu jawaban untuk setiap pernyataan berikut. Jawaban Anda bersifat anonim dan
              hanya digunakan untuk peningkatan layanan.
            </p>

            {QUESTIONS.map((q, idx) => {
              const labelId = `${uid}-q${idx + 1}`;
              return (
                <fieldset key={q.id} className="border-0 p-0 m-0">
                  <legend id={labelId} className="text-sm font-medium text-gray-900 mb-0 w-full">
                    <span className="text-gray-400 font-normal mr-1.5">{idx + 1}.</span>
                    {q.text}
                  </legend>
                  <LikertScale
                    groupName={`${uid}-${q.id}`}
                    labelId={labelId}
                    value={responses[q.id]}
                    onChange={(v) => handleSetResponse(q.id, v)}
                  />
                </fieldset>
              );
            })}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-xl shrink-0">
          <p className="text-xs text-gray-400">{answeredCount} / 4 terjawab</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRemindLater}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            >
              Batalkan
            </button>
            <button
              type="submit"
              form={`${uid}-form`}
              disabled={!allAnswered || submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Menyimpan…' : 'Kirim Survei'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

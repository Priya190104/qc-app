'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { onUmuxCheckNeeded } from '@/lib/umux-events';
import { apiClient } from '@/lib/api';
import { isDismissedThisSession, hasSubmittedThisSession } from '@/lib/umux-storage';

// ─── Config ───────────────────────────────────────────────────────────────────

/**
 * Minimum milliseconds between consecutive server status checks.
 * Prevents burst calls when multiple queued requests all resolve after
 * a single token refresh triggers the event.
 */
const CHECK_DEBOUNCE_MS = 5_000;

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns `shouldShow` and `dismiss` driven by server-side monthly UMUX status.
 *
 * Trigger events (both call GET /feedback/umux/status):
 *   1. On mount   — covers the "just logged in + redirected" and "page refresh" cases.
 *   2. On token refresh event (emitUmuxCheckNeeded) — covers long sessions where
 *      the access token is silently renewed by the Axios interceptor.
 *
 * Show conditions (all must be true):
 *   • Server reports hasSurveyedThisMonth === false for the current user
 *   • User has not dismissed the invitation in this tab session
 *   • User has not submitted the survey in this tab session
 *
 * Applies to all authenticated roles without exception.
 * Monthly reset is handled server-side by checking submittedAt >= first of month.
 */
export function useUmuxTrigger() {
  const [shouldShow, setShouldShow] = useState(false);

  // Refs for values needed inside async callbacks (avoids stale closures)
  const shouldShowRef = useRef(false);
  const isCheckingRef = useRef(false);
  const lastCheckRef = useRef<number>(0);
  const mountedRef = useRef(true);

  // Keep shouldShowRef in sync with React state
  useEffect(() => {
    shouldShowRef.current = shouldShow;
  }, [shouldShow]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── Core status check ───────────────────────────────────────────────────────

  /**
   * Calls the backend status endpoint and shows the modal if the user
   * has not yet completed the UMUX survey for the current calendar month.
   * Concurrent and rapid calls are deduplicated via refs.
   */
  const runCheck = useCallback(async () => {
    // Skip if the modal is already on screen
    if (shouldShowRef.current) return;
    // Skip if user already interacted with the invitation this session
    if (isDismissedThisSession()) return;
    if (hasSubmittedThisSession()) return;
    // Debounce: ignore calls that arrive within CHECK_DEBOUNCE_MS of the last check
    const now = Date.now();
    if (now - lastCheckRef.current < CHECK_DEBOUNCE_MS) return;
    // Guard against concurrent in-flight checks
    if (isCheckingRef.current) return;

    isCheckingRef.current = true;
    lastCheckRef.current = now;

    try {
      const res = await apiClient.get<any>('/feedback/umux/status');
      // Handle both globally-wrapped ({ data: { hasSurveyedThisMonth } })
      // and unwrapped ({ hasSurveyedThisMonth }) responses defensively.
      const hasSurveyed: boolean =
        res.data?.data?.hasSurveyedThisMonth ?? res.data?.hasSurveyedThisMonth ?? true; // default true — never interrupt UX on an unexpected response shape

      if (!hasSurveyed && mountedRef.current && !isDismissedThisSession()) {
        setShouldShow(true);
      }
    } catch {
      // A failed status check must never disrupt the user's workflow.
      // The next trigger event will retry.
    } finally {
      isCheckingRef.current = false;
    }
  }, []); // stable — all dependencies accessed via refs or imported constants

  // Run immediately on mount (covers: post-login redirect, page refresh)
  useEffect(() => {
    runCheck();
  }, [runCheck]);

  // Subscribe to token-refresh events (covers: long-running sessions)
  useEffect(() => {
    return onUmuxCheckNeeded(runCheck);
  }, [runCheck]);

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Call when the modal closes (dismiss or submit).
   * UmuxModal calls dismissForSession() / recordSubmission() internally
   * before invoking this; those set the session guards that prevent re-shows.
   */
  const dismiss = useCallback(() => {
    setShouldShow(false);
  }, []);

  return { shouldShow, dismiss };
}

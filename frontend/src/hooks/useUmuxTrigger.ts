'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores';
import {
  initSession,
  recordPageVisit,
  isSessionMature,
  hasCompletedWorkflow,
  isSurveyDue,
  isDismissedThisSession,
} from '@/lib/umux-storage';

// ─── Config ───────────────────────────────────────────────────────────────────

/** Roles that are eligible for the UMUX survey. */
const QUALIFYING_ROLES = [
  'administrator',
  'operator-data-berkas',
  'operator-data-pemetaan',
  'operator-data-ukur',
  'quality-control-officer',
];

/** Inactivity duration before we attempt to show the invitation (45 s). */
const IDLE_TIMEOUT_MS = 45_000;

/** Routes where the invitation is never shown. */
const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/'];

/** Operational routes where showing a survey popup would be disruptive. */
const EXCLUDED_PATH_PREFIXES = ['/backup'];

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns `shouldShow` (a boolean that becomes true when all trigger conditions
 * are met) and `dismiss` (call this when the modal is closed for any reason).
 *
 * All trigger conditions must be true simultaneously:
 *   1. Authenticated user with a qualifying role
 *   2. Session has been active ≥ 10 minutes
 *   3. User has navigated to ≥ 2 protected routes (workflow proxy)
 *   4. Survey is due (never submitted, or last submission > 30 days ago)
 *   5. User hasn't dismissed the invitation during the current session
 *   6. User is idle (no keyboard / pointer events for IDLE_TIMEOUT_MS)
 *   7. No other dialogs are currently open in the DOM
 *   8. No form element is focused (user is not actively typing)
 *   9. Not on an excluded path (backup/restore)
 */
export function useUmuxTrigger() {
  const { user, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const [shouldShow, setShouldShow] = useState(false);

  // Stable refs so callbacks don't become stale
  const shouldShowRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // Keep shouldShowRef in sync
  useEffect(() => {
    shouldShowRef.current = shouldShow;
  }, [shouldShow]);

  // Clean up on unmount
  useEffect(() => {
    initSession();
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Track page navigations as workflow proxy
  useEffect(() => {
    if (pathname && !PUBLIC_PATHS.includes(pathname)) {
      recordPageVisit();
    }
  }, [pathname]);

  // ── Core eligibility check ──────────────────────────────────────────────────

  const checkAndShow = useCallback(() => {
    if (!mountedRef.current) return;
    if (shouldShowRef.current) return; // already visible — don't re-evaluate

    // Path guards
    if (PUBLIC_PATHS.includes(pathname)) return;
    if (EXCLUDED_PATH_PREFIXES.some((p) => pathname.startsWith(p))) return;

    // Auth
    if (!isAuthenticated || !user) return;

    // Role
    const roles = user.roles?.map((r) => r.name) ?? [];
    if (!roles.some((r) => QUALIFYING_ROLES.includes(r))) return;

    // Session maturity (10 min)
    if (!isSessionMature()) return;

    // Workflow proxy (≥ 2 page visits)
    if (!hasCompletedWorkflow()) return;

    // 30-day cooldown
    if (!isSurveyDue()) return;

    // Session-level dismissal
    if (isDismissedThisSession()) return;

    // DOM guards (run last — these are the most expensive checks)
    if (typeof document !== 'undefined') {
      // No other dialogs open
      if (document.querySelectorAll('[role="dialog"]').length > 0) return;

      // No form element is currently focused
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement
      )
        return;
    }

    setShouldShow(true);
  }, [pathname, isAuthenticated, user]);

  // ── Idle timer management ───────────────────────────────────────────────────

  const scheduleIdleCheck = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(checkAndShow, IDLE_TIMEOUT_MS);
  }, [checkAndShow]);

  const handleActivity = useCallback(() => {
    // Once the modal is visible, activity should not dismiss it — the user
    // must explicitly interact with the invitation card.
    if (shouldShowRef.current) return;
    scheduleIdleCheck();
  }, [scheduleIdleCheck]);

  // Wire up activity listeners and start the initial idle timer
  useEffect(() => {
    const events = ['keydown', 'mousemove', 'mousedown', 'touchstart', 'scroll'] as const;
    events.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));
    scheduleIdleCheck(); // start counting from mount

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [handleActivity, scheduleIdleCheck]);

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Call this when the modal is closed (either by dismiss or submission).
   * The umux-storage layer is responsible for preventing re-shows:
   *   – dismissForSession() → blocks re-show for the current session
   *   – recordSubmission()  → blocks re-show for 30 days
   * Both are called from within UmuxModal before invoking this callback.
   */
  const dismiss = useCallback(() => {
    setShouldShow(false);
    // Don't restart the idle timer immediately; give the user a break.
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  }, []);

  return { shouldShow, dismiss };
}

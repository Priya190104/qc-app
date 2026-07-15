/**
 * UMUX evaluation — client-side storage utilities.
 *
 * localStorage keys (persist across sessions):
 *   umux_last_submitted  — Unix timestamp (ms) of last survey submission
 *
 * sessionStorage keys (cleared when the tab/window closes):
 *   umux_session_start   — Unix timestamp (ms) when the current session started
 *   umux_page_visits     — integer counter of protected-route navigations
 *   umux_dismissed       — "true" if the user chose "Ingatkan Nanti" this session
 */

const LS_LAST_SUBMITTED = 'umux_last_submitted';
const SS_SESSION_START = 'umux_session_start';
const SS_PAGE_VISITS = 'umux_page_visits';
const SS_DISMISSED = 'umux_dismissed';

/** Minimum session duration before the survey can be triggered (10 minutes). */
const MIN_SESSION_MS = 10 * 60 * 1000;

/** Minimum page-visit count as proxy for "completed a meaningful workflow". */
const MIN_PAGE_VISITS = 2;

/** Days between survey invitations. */
const COOLDOWN_DAYS = 30;

// ─── Session init ─────────────────────────────────────────────────────────────

/** Call once on app mount to record the session start time. */
export function initSession(): void {
  if (typeof window === 'undefined') return;
  if (!sessionStorage.getItem(SS_SESSION_START)) {
    sessionStorage.setItem(SS_SESSION_START, String(Date.now()));
  }
  if (!sessionStorage.getItem(SS_PAGE_VISITS)) {
    sessionStorage.setItem(SS_PAGE_VISITS, '0');
  }
}

/** Call on every protected-route navigation to build the workflow proxy counter. */
export function recordPageVisit(): void {
  if (typeof window === 'undefined') return;
  const n = parseInt(sessionStorage.getItem(SS_PAGE_VISITS) ?? '0', 10);
  sessionStorage.setItem(SS_PAGE_VISITS, String(n + 1));
}

// ─── Condition checks ─────────────────────────────────────────────────────────

/** True if the session has lasted at least 10 minutes. */
export function isSessionMature(): boolean {
  if (typeof window === 'undefined') return false;
  const start = sessionStorage.getItem(SS_SESSION_START);
  if (!start) return false;
  return Date.now() - parseInt(start, 10) >= MIN_SESSION_MS;
}

/**
 * True if the user has visited at least MIN_PAGE_VISITS protected pages
 * this session (used as proxy for "completed a meaningful workflow").
 */
export function hasCompletedWorkflow(): boolean {
  if (typeof window === 'undefined') return false;
  const n = parseInt(sessionStorage.getItem(SS_PAGE_VISITS) ?? '0', 10);
  return n >= MIN_PAGE_VISITS;
}

/** True if 30 days have passed since the last submission (or never submitted). */
export function isSurveyDue(): boolean {
  if (typeof window === 'undefined') return false;
  const last = localStorage.getItem(LS_LAST_SUBMITTED);
  if (!last) return true;
  const daysSince = (Date.now() - parseInt(last, 10)) / (1000 * 60 * 60 * 24);
  return daysSince >= COOLDOWN_DAYS;
}

/** True if the user dismissed the invitation during the current session. */
export function isDismissedThisSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SS_DISMISSED) === 'true';
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Mark the invitation as dismissed for this session only.
 * The survey will be eligible again next session (subject to normal conditions).
 */
export function dismissForSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SS_DISMISSED, 'true');
}

/**
 * Record a completed survey submission.
 * The 30-day cooldown starts from this call.
 */
export function recordSubmission(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_LAST_SUBMITTED, String(Date.now()));
}

/** Returns the ISO date string of the last submission, or null. */
export function getLastSubmissionDate(): string | null {
  if (typeof window === 'undefined') return null;
  const ts = localStorage.getItem(LS_LAST_SUBMITTED);
  if (!ts) return null;
  return new Date(parseInt(ts, 10)).toISOString();
}

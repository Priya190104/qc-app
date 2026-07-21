/**
 * UMUX evaluation — client-side session utilities.
 *
 * The server is the authoritative source for monthly completion tracking
 * (via GET /feedback/umux/status).
 * This module only tracks the current browser session state to prevent
 * re-showing the popup after the user has already interacted with it
 * within the same tab session.
 *
 * sessionStorage keys (cleared when the tab/window closes):
 *   umux_dismissed  — "true" if user clicked "Ingatkan Nanti" this session
 *   umux_submitted  — "true" if user successfully submitted the survey this session
 */

const SS_DISMISSED = 'umux_dismissed';
const SS_SUBMITTED = 'umux_submitted';

/**
 * Mark the invitation as dismissed for this session ("Ingatkan Nanti").
 * The survey may be shown again in a new session if still unsubmitted this month.
 */
export function dismissForSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SS_DISMISSED, 'true');
}

/** True if the user dismissed the invitation during the current session. */
export function isDismissedThisSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SS_DISMISSED) === 'true';
}

/**
 * Record a completed survey submission for this session.
 * Prevents the modal from re-appearing immediately after a successful submit
 * without waiting for the next server status check.
 */
export function recordSubmission(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SS_SUBMITTED, 'true');
  // Also set dismissed so the session guard is consistent regardless of
  // which flag is checked first.
  sessionStorage.setItem(SS_DISMISSED, 'true');
}

/** True if the user successfully submitted the survey in this session. */
export function hasSubmittedThisSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SS_SUBMITTED) === 'true';
}

/**
 * Minimal pub/sub for UMUX status check triggers.
 *
 * Emitters:
 *   emitUmuxCheckNeeded() — called by APIClient after a successful token refresh
 *
 * Subscribers:
 *   useUmuxTrigger — listens while mounted to perform the server status check
 *
 * Using a plain Set instead of a full event emitter keeps bundle size zero and
 * avoids coupling to any framework. Safe to call from non-React code (interceptors).
 */

type Callback = () => void;

const listeners = new Set<Callback>();

/**
 * Subscribe to UMUX check requests.
 * Returns an unsubscribe function suitable for React useEffect cleanup.
 */
export function onUmuxCheckNeeded(cb: Callback): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Notify all subscribed listeners that a UMUX status check should run.
 * Safe to call outside React (e.g. from Axios interceptors).
 * Individual listener errors are swallowed to prevent one bad listener
 * from blocking others.
 */
export function emitUmuxCheckNeeded(): void {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch {
      // listeners must not throw — swallow silently
    }
  });
}

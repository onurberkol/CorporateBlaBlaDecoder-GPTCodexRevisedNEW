/** Replace this redacted seam with Sentry/Crashlytics after the project is provisioned. */
export function initCrash(): void { /* intentionally no-op until a DSAR-safe crash vendor is configured */ }

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (__DEV__) console.warn('[captured error]', error instanceof Error ? error.message : String(error), context);
}

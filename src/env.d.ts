interface Window {
  /** Google Analytics 4. Present only in production builds. */
  gtag?: (command: 'event' | 'config' | 'js', ...args: unknown[]) => void;
  dataLayer?: unknown[];

  /** Vercel Web Analytics queue. Present only in production builds. */
  va?: (event: 'event', payload: { name: string; data?: Record<string, string | number> }) => void;
}

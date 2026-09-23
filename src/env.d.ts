interface Window {
  /** Vercel Web Analytics queue. Present only in production builds. */
  va?: (event: 'event', payload: { name: string; data?: Record<string, string | number> }) => void;
}

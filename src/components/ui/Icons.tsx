type P = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const Icons: Record<string, (p: P) => React.ReactElement> = {
  camera: ({ className = "h-6 w-6" }: P) => (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.7c.5 0 1-.3 1.3-.7l.8-1.2c.3-.4.7-.6 1.2-.6h3c.5 0 .9.2 1.2.6l.8 1.2c.3.4.8.7 1.3.7h1.7A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="13" r="3.6" />
    </svg>
  ),
  sparkles: ({ className = "h-6 w-6" }: P) => (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 3.2 13.7 8 18.5 9.7 13.7 11.4 12 16.2 10.3 11.4 5.5 9.7 10.3 8z" />
      <path d="M18.5 15.2 19.3 17.4 21.5 18.2 19.3 19 18.5 21.2 17.7 19 15.5 18.2 17.7 17.4z" />
    </svg>
  ),
  barcode: ({ className = "h-6 w-6" }: P) => (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M3 8V5.6A2.6 2.6 0 0 1 5.6 3H8M16 3h2.4A2.6 2.6 0 0 1 21 5.6V8M21 16v2.4a2.6 2.6 0 0 1-2.6 2.6H16M8 21H5.6A2.6 2.6 0 0 1 3 18.4V16" />
      <path d="M7.5 8v8M10.5 8v8M13.5 8v8M16.5 8v8" />
    </svg>
  ),
  chart: ({ className = "h-6 w-6" }: P) => (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 20h16" />
      <rect x="5" y="12" width="3.6" height="6" rx="1.4" />
      <rect x="10.2" y="7" width="3.6" height="11" rx="1.4" />
      <rect x="15.4" y="9.8" width="3.6" height="8.2" rx="1.4" />
    </svg>
  ),
  drop: ({ className = "h-6 w-6" }: P) => (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 3.5c3.2 3.6 5.5 6.4 5.5 9.3A5.5 5.5 0 0 1 12 18.3a5.5 5.5 0 0 1-5.5-5.5c0-2.9 2.3-5.7 5.5-9.3Z" />
      <path d="M9.3 13.4a2.9 2.9 0 0 0 2.6 2.5" opacity=".55" />
    </svg>
  ),
  scale: ({ className = "h-6 w-6" }: P) => (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 4.2v15.4M7.4 19.6h9.2M4.6 6.4h14.8" />
      <path d="M4.6 6.4 2 13a3.1 3.1 0 0 0 5.2 0zM19.4 6.4 16.8 13a3.1 3.1 0 0 0 5.2 0z" />
      <circle cx="12" cy="4" r="1.4" />
    </svg>
  ),
  flame: ({ className = "h-6 w-6" }: P) => (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 3.2c3.4 3.1 5.8 5.9 5.8 9.3A5.8 5.8 0 0 1 12 20.6a5.8 5.8 0 0 1-5.8-8.1c.8 1.2 1.7 1.7 2.7 1.5-.6-3.4.5-6.7 3.1-10.8Z" />
      <path d="M12 16.9a2.2 2.2 0 0 0 2.2-2.4c0-1-.7-1.9-2.2-3-1.5 1.1-2.2 2-2.2 3a2.2 2.2 0 0 0 2.2 2.4Z" opacity=".55" />
    </svg>
  ),
  bell: ({ className = "h-6 w-6" }: P) => (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6.2 16.4c-.5 0-.8-.5-.6-1l.9-1.9V10a5.5 5.5 0 0 1 11 0v3.5l.9 1.9c.2.5-.1 1-.6 1z" />
      <path d="M10 19.2a2.2 2.2 0 0 0 4 0" />
    </svg>
  ),
  globe: ({ className = "h-6 w-6" }: P) => (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.6 12h16.8M12 3.4c2.3 2.3 3.4 5.2 3.4 8.6S14.3 18.3 12 20.6c-2.3-2.3-3.4-5.2-3.4-8.6S9.7 5.7 12 3.4Z" />
    </svg>
  ),
  check: ({ className = "h-4 w-4" }: P) => (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2.4}>
      <path d="m5 12.8 4.4 4.4L19 7.4" />
    </svg>
  ),
  arrow: ({ className = "h-4 w-4" }: P) => (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  plus: ({ className = "h-4 w-4" }: P) => (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
};

export function AppleGlyph({ className = "h-6 w-6" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.53c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.71-3.19-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.18-1.54 2.67-.39 6.62 1.11 8.79.73 1.06 1.6 2.25 2.74 2.21 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.71.71 2.87.69 1.19-.02 1.94-1.08 2.66-2.14.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.32-.89-2.34-3.54zM14.86 5.2c.61-.74 1.02-1.77.91-2.8-.88.04-1.94.59-2.57 1.32-.56.65-1.05 1.7-.92 2.7.98.08 1.98-.5 2.58-1.22z" />
    </svg>
  );
}

export function PlayGlyph({ className = "h-6 w-6" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#00A0FF"
        d="M3.6 1.8c-.4.4-.6.9-.6 1.6v17.2c0 .7.2 1.2.6 1.6l.1.1L13.3 12v-.2L3.7 1.8z"
      />
      <path fill="#FFBC00" d="m16.5 15.2-3.2-3.2v-.2l3.2-3.2.1.1 3.8 2.2c1.1.6 1.1 1.6 0 2.2z" />
      <path fill="#FF3A44" d="m16.6 15.1-3.3-3.3-9.7 9.8c.4.4 1 .4 1.7.1z" />
      <path fill="#00C853" d="M16.6 8.9 5.3 2.3c-.7-.4-1.3-.3-1.7.1l9.7 9.6z" />
    </svg>
  );
}

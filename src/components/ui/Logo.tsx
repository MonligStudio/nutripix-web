export function LogoMark({
  className = "h-9 w-9",
  glow = true,
}: {
  className?: string;
  glow?: boolean;
}) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      {glow && (
        <defs>
          <filter id="lg" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <g
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={glow ? "url(#lg)" : undefined}
      >
        {/* tarayıcı köşeleri */}
        <path d="M4 15V8.5A4.5 4.5 0 0 1 8.5 4H15" opacity=".75" />
        <path d="M33 4h6.5A4.5 4.5 0 0 1 44 8.5V15" opacity=".75" />
        <path d="M44 33v6.5a4.5 4.5 0 0 1-4.5 4.5H33" opacity=".75" />
        <path d="M15 44H8.5A4.5 4.5 0 0 1 4 39.5V33" opacity=".75" />
        {/* elma */}
        <path d="M24 19.4c-2.9-3.7-8.3-3.2-10.3 1.2-2 4.4-1 11.2 2.4 15.1 1.9 2.2 3.9 2.5 5.8 1.5 1.3-.6 2.9-.6 4.2 0 1.9 1 3.9.7 5.8-1.5 3.4-3.9 4.4-10.7 2.4-15.1-2-4.4-7.4-4.9-10.3-1.2Z" />
        <path d="M24.5 18.9c.4-4.2 3.2-6.9 7-7.2.3 4.2-2.6 7-6.4 7.5" />
        <path d="M17.6 25.2c.6-2.6 2.2-4.3 4.4-4.9" opacity=".55" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display font-extrabold tracking-[-0.04em] ${className}`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      Nutri<span className="text-mint">Pix</span>
    </span>
  );
}

export function LogoLockup({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8 text-mint" />
      <Wordmark className="text-[19px]" />
    </span>
  );
}

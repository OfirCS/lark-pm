'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: 'text-base' },
  md: { icon: 36, text: 'text-lg' },
  lg: { icon: 44, text: 'text-xl' },
};

// Geometric lark — clean arcs, a single sweeping wing stroke, and a sharp tail
function LarkIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body — continuous flowing silhouette */}
      <path
        d="M6 22C5 19 7 14 12 11C15 9 18 9.5 20 11.5L24 7.5C25.5 6 28 6 29.5 7.5C31 9 30.5 11.5 29 13L25 17C23 20 19 23 14 24.5C9 26 6.5 24 6 22Z"
        fill="currentColor"
      />
      {/* Wing — elegant inner arc */}
      <path
        d="M10 20C12 16.5 16 13 20 11.5"
        stroke="var(--background, #fafaf9)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.3"
      />
      {/* Head */}
      <circle cx="29" cy="8.5" r="3.8" fill="currentColor" />
      {/* Eye */}
      <circle cx="30" cy="7.8" r="1.1" fill="var(--background, #fafaf9)" />
      {/* Beak */}
      <path d="M31.5 10L32 8.5L31.5 11.5Z" fill="currentColor" />
      {/* Tail — two sweeping lines */}
      <path
        d="M5 21.5C3.5 23.5 3 26 3.5 27M6.5 20.5C4.5 22.5 4 24.5 4.5 25.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const { icon, text } = sizes[size];

  if (variant === 'icon') {
    return (
      <div className={`rounded-xl bg-[var(--foreground)] flex items-center justify-center ${className}`} style={{ width: icon, height: icon }}>
        <LarkIcon size={icon * 0.6} className="text-[var(--background)]" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="rounded-xl bg-[var(--foreground)] flex items-center justify-center"
        style={{ width: icon, height: icon }}
      >
        <LarkIcon size={icon * 0.6} className="text-[var(--background)]" />
      </div>
      <span className={`font-display tracking-tight ${text}`}>Lark</span>
    </div>
  );
}

// Export the icon separately for flexible use
export { LarkIcon };

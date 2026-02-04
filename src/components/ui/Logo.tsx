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

// Bird holding twig logo - clear lark silhouette
function LarkIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bird body - streamlined shape */}
      <path
        d="M12 38C10 35 10 30 14 26C18 22 24 22 28 24L32 20C34 18 38 16 42 18C46 20 48 24 46 28C44 32 40 34 36 33L32 36C30 38 26 42 22 44C18 46 14 42 12 38Z"
        fill="currentColor"
      />
      {/* Wing detail */}
      <path
        d="M18 32C20 30 24 28 28 28"
        stroke="var(--background, #fafaf9)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Bird head - clear round shape */}
      <circle cx="44" cy="20" r="8" fill="currentColor"/>
      {/* Eye - prominent */}
      <circle cx="46" cy="18" r="2" fill="var(--background, #fafaf9)"/>
      {/* Beak - clear triangular shape holding twig */}
      <path d="M50 22L58 20L50 24Z" fill="currentColor"/>
      {/* Twig/stick in beak - clear Y-shape */}
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M56 21L60 25L58 32"/>
        <path d="M59 27L62 26"/>
        <path d="M58 30L61 32"/>
      </g>
      {/* Tail feathers - elegant spread */}
      <path
        d="M8 36C6 38 4 42 6 44C8 42 10 40 12 38M10 34C8 36 5 38 6 40"
        stroke="currentColor"
        strokeWidth="2.5"
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
        <LarkIcon size={icon * 0.65} className="text-[var(--background)]" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="rounded-xl bg-[var(--foreground)] flex items-center justify-center"
        style={{ width: icon, height: icon }}
      >
        <LarkIcon size={icon * 0.65} className="text-[var(--background)]" />
      </div>
      <span className={`font-semibold tracking-tight ${text}`}>Lark</span>
    </div>
  );
}

// Export the icon separately for flexible use
export { LarkIcon };

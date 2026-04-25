import { type ReactNode, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
}

const BASE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontWeight: 700,
  borderRadius: 20,
  transition: 'opacity 0.12s, transform 0.12s',
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none',
};

const VARIANTS: Record<Variant, React.CSSProperties> = {
  primary:   { background: '#0066FF', color: '#FFFFFF', boxShadow: '0 4px 16px rgba(0,102,255,0.30)' },
  secondary: { background: '#EEF4FF', color: '#0066FF', boxShadow: 'none' },
  ghost:     { background: 'transparent', color: '#0066FF', border: '1.5px solid #E5E7EB' },
};

// a11y: toutes les tailles respectent 56px minimum de cible tactile
const SIZES: Record<Size, React.CSSProperties> = {
  sm: { height: 44, padding: '0 16px', fontSize: 14 },
  md: { height: 56, padding: '0 24px', fontSize: 16 },
  lg: { height: 72, padding: '0 28px', fontSize: 18 },
};

export function Button({ variant = 'primary', size = 'md', fullWidth = false, children, style, ...props }: Props) {
  return (
    <button
      {...props}
      style={{
        ...BASE,
        ...VARIANTS[variant],
        ...SIZES[size],
        width: fullWidth ? '100%' : undefined,
        opacity: props.disabled ? 0.5 : 1,
        ...style,
      }}
      onTouchStart={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)';
        props.onTouchStart?.(e);
      }}
      onTouchEnd={(e) => {
        (e.currentTarget as HTMLElement).style.transform = '';
        props.onTouchEnd?.(e);
      }}
    >
      {children}
    </button>
  );
}

import { type ReactNode } from 'react';

type Variant = 'primary' | 'success' | 'warning' | 'neutral';

interface Props {
  children: ReactNode;
  variant?: Variant;
  size?: number;
}

const BG: Record<Variant, string> = {
  primary: '#EEF4FF',
  success: '#E6FAF0',
  warning: '#FFF4E6',
  neutral: '#F5F5F7',
};

// Conteneur circulaire pour icône — 52px par défaut (cible tactile sûre)
export function IconBadge({ children, variant = 'primary', size = 52 }: Props) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: BG[variant],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}

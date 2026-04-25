import { useRef, useEffect, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  title: string;
  dark?: boolean;
  maxHeight?: string;
  onClose?: () => void;
}

// a11y: role dialog + aria-modal pour les lecteurs d'écran
export function BottomSheet({ children, title, dark = false, maxHeight = '85vh', onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Focus trap : au montage, focus le premier élément interactif
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    el?.focus();
  }, []);

  // Fermer sur Escape
  useEffect(() => {
    if (!onClose) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        background: dark ? '#1E1E1E' : '#FFFFFF',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.14)',
        maxHeight,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        zIndex: 100,
      }}
    >
      {/* Handle */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', flexShrink: 0 }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: dark ? '#444' : '#DDD' }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 env(safe-area-inset-bottom, 8px)' }}>
        {children}
      </div>
    </div>
  );
}

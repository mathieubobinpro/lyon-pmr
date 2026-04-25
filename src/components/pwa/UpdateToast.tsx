import { RefreshCw } from 'lucide-react';

interface Props {
  onUpdate: () => void;
  dark?: boolean;
}

export function UpdateToast({ onUpdate, dark = false }: Props) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed', bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))', left: 16, right: 16,
        background: dark ? '#1E1E1E' : '#FFFFFF',
        borderRadius: 16, padding: '14px 18px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
        display: 'flex', alignItems: 'center', gap: 12,
        zIndex: 500, fontSize: 14,
        border: `1.5px solid ${dark ? '#333' : '#E5E7EB'}`,
      }}
    >
      <RefreshCw size={20} color="#0066FF" aria-hidden />
      <span style={{ flex: 1, color: dark ? '#F0F0F0' : '#1A1A1A', fontWeight: 500 }}>
        Nouvelle version disponible
      </span>
      <button
        onClick={onUpdate}
        style={{
          background: '#0066FF', color: '#FFFFFF', border: 'none', cursor: 'pointer',
          borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700,
          minHeight: 36,
        }}
        aria-label="Recharger pour mettre à jour l'application"
      >
        Recharger
      </button>
    </div>
  );
}

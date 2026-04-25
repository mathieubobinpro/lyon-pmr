import { WifiOff } from 'lucide-react';

interface Props {
  savedAt: number | null;
  dark?: boolean;
}

function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(ts);
}

export function OfflineBanner({ savedAt, dark = false }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', top: 'env(safe-area-inset-top, 0)', left: 0, right: 0,
        background: dark ? '#2A1F00' : '#FFF4E6',
        borderBottom: '1px solid #FF8800',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        zIndex: 500, fontSize: 13, color: '#FF8800', fontWeight: 600,
      }}
    >
      <WifiOff size={16} aria-hidden />
      <span>
        Mode hors-ligne
        {savedAt ? ` — données du ${formatDate(savedAt)}` : ''}
      </span>
    </div>
  );
}
